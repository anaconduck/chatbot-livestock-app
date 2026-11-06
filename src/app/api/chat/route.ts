import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendChatMessage } from "@/lib/dify/chat";
import { checkRateLimit } from "@/lib/security/rateLimiter";
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
}

async function getChatIdentity(): Promise<ChatIdentity> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("tanyaternak_role")?.value;

  if (roleCookie === "USER" || roleCookie === "ADMIN") {
    return {
      difyUserId: `user-${roleCookie.toLowerCase()}`,
      authenticated: true,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && user) {
      return {
        difyUserId: user.id,
        authenticated: true,
      };
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

    return NextResponse.json({
      ...response,
      authenticated: identity.authenticated,
    });
  } catch (error: unknown) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "Terjadi kendala pada layanan AI." },
      { status: 500 }
    );
  }
}
