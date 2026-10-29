import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendChatMessage } from "@/lib/dify/chat";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const MAX_QUERY_LENGTH = 1000;
export const MAX_REQUESTS_PER_MINUTE = 15;

const chatRequestSchema = z.object({
  query: z.string().trim().min(1).max(MAX_QUERY_LENGTH),
  conversation_id: z.string().trim().min(1).optional(),
});

const ANONYMOUS_CHAT_COOKIE = "tanyaternak_chat_visitor";
const ANONYMOUS_CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface ChatIdentity {
  difyUserId: string;
  authenticated: boolean;
  databaseUserId?: string;
}

interface ChatExchange {
  userId: string;
  query: string;
  answer: string;
  difyConversationId: string;
  difyMessageId: string;
}

async function persistChatExchange(exchange: ChatExchange): Promise<void> {
  const adminClient = createAdminClient();
  const { data: existingConversation, error: findError } = await adminClient
    .from("conversations")
    .select("id")
    .eq("user_id", exchange.userId)
    .eq("dify_conversation_id", exchange.difyConversationId)
    .maybeSingle();

  if (findError) {
    throw new Error(`Gagal mencari riwayat percakapan: ${findError.message}`);
  }

  let conversationId = existingConversation?.id as string | undefined;

  if (!conversationId) {
    const title =
      exchange.query.length > 80
        ? `${exchange.query.slice(0, 77)}...`
        : exchange.query;
    const { data: createdConversation, error: createError } = await adminClient
      .from("conversations")
      .insert({
        user_id: exchange.userId,
        title,
        dify_conversation_id: exchange.difyConversationId,
      })
      .select("id")
      .single();

    if (createError || !createdConversation) {
      throw new Error(
        `Gagal membuat riwayat percakapan: ${createError?.message || "Data tidak tersedia."}`
      );
    }

    conversationId = createdConversation.id as string;
  }

  const { error: messagesError } = await adminClient.from("messages").insert([
    {
      conversation_id: conversationId,
      role: "user",
      content: exchange.query,
    },
    {
      conversation_id: conversationId,
      role: "assistant",
      content: exchange.answer,
      dify_message_id: exchange.difyMessageId,
    },
  ]);

  if (messagesError) {
    throw new Error(`Gagal menyimpan pesan: ${messagesError.message}`);
  }

  const { error: updateError } = await adminClient
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (updateError) {
    throw new Error(`Gagal memperbarui percakapan: ${updateError.message}`);
  }
}

async function getChatIdentity(): Promise<ChatIdentity> {
  const cookieStore = await cookies();
  const isDevelopmentDemo =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isDevelopmentDemo) {
    const demoRole = cookieStore.get("tanyaternak_role")?.value;

    if (demoRole === "USER" || demoRole === "ADMIN") {
      return {
        difyUserId: `demo-${demoRole.toLowerCase()}`,
        authenticated: true,
      };
    }
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .single();

      if (!profileError && profile?.is_active) {
        return {
          difyUserId: user.id,
          authenticated: true,
          databaseUserId: user.id,
        };
      }
    }
  } catch {
    // Chat remains available as an anonymous session if auth is unavailable.
  }

  const existingVisitorId = cookieStore.get(ANONYMOUS_CHAT_COOKIE)?.value;
  const visitorId =
    existingVisitorId && /^[0-9a-f-]{36}$/i.test(existingVisitorId)
      ? existingVisitorId
      : crypto.randomUUID();

  if (!existingVisitorId || existingVisitorId !== visitorId) {
    cookieStore.set(ANONYMOUS_CHAT_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ANONYMOUS_CHAT_COOKIE_MAX_AGE,
    });
  }

  return {
    difyUserId: `guest-${visitorId}`,
    authenticated: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const identity = await getChatIdentity();

    const requestBody: unknown = await req.json().catch(() => null);
    const parsedBody = chatRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: `Pertanyaan wajib diisi dan maksimal ${MAX_QUERY_LENGTH} karakter.`,
        },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = identity.authenticated
      ? `user:${identity.difyUserId}`
      : `guest:${clientIp}`;
    const rateCheck = checkRateLimit(
      rateLimitKey,
      MAX_REQUESTS_PER_MINUTE,
      60 * 1000
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan. Silakan tunggu ${rateCheck.resetInSeconds} detik sebelum bertanya kembali.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateCheck.resetInSeconds.toString(),
          },
        }
      );
    }

    const response = await sendChatMessage({
      query: parsedBody.data.query,
      conversation_id: parsedBody.data.conversation_id,
      user: identity.difyUserId,
    });

    let historySaved = false;

    if (identity.databaseUserId) {
      try {
        await persistChatExchange({
          userId: identity.databaseUserId,
          query: parsedBody.data.query,
          answer: response.answer,
          difyConversationId: response.conversation_id,
          difyMessageId: response.message_id,
        });
        historySaved = true;
      } catch (historyError: unknown) {
        console.error("Error saving chat history:", historyError);
      }
    }

    return NextResponse.json({
      ...response,
      history_saved: historySaved,
    });
  } catch (error: unknown) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "Terjadi kendala pada layanan AI." },
      { status: 500 }
    );
  }
}
