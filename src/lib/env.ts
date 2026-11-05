import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("TanyaTernak"),
  NEXT_PUBLIC_DEMO_MODE: z
    .enum(["true", "false", "1", "0"])
    .default("true")
    .transform((val) => val === "true" || val === "1"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default("https://dummy-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default("dummy-anon-key"),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default("dummy-service-role-key"),
  DIFY_BASE_URL: z.string().url().default("https://api.dify.ai/v1"),
  DIFY_CHAT_API_KEY: z.string().optional().default("dummy-dify-chat-key"),
  DIFY_KNOWLEDGE_API_KEY: z.string().optional().default("dummy-dify-knowledge-key"),
  DIFY_DATASET_ID: z.string().optional().default("dummy-dataset-id"),
  DIFY_MOCK_MODE: z
    .enum(["true", "false", "1", "0"])
    .default("true")
    .transform((val) => val === "true" || val === "1"),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

export const getServerEnv = () => {
  if (typeof window !== "undefined") {
    throw new Error("Server environment variables cannot be accessed on the client side.");
  }
  return serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DIFY_BASE_URL: process.env.DIFY_BASE_URL,
    DIFY_CHAT_API_KEY: process.env.DIFY_CHAT_API_KEY,
    DIFY_KNOWLEDGE_API_KEY: process.env.DIFY_KNOWLEDGE_API_KEY,
    DIFY_DATASET_ID: process.env.DIFY_DATASET_ID,
    DIFY_MOCK_MODE: process.env.DIFY_MOCK_MODE,
  });
};
