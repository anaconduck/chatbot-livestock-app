export type UserRole = "USER" | "ADMIN";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentType = "FUN_FACT" | "JURNAL";

export interface KnowledgeDocument {
  id: string;
  content_type: ContentType;
  title: string;
  category: string;
  description: string;
  author?: string | null;
  source_url?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  dify_conversation_id?: string | null;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface ChatSource {
  title: string;
  author?: string;
  year?: number;
  page?: number | string;
  snippet?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  dify_message_id?: string | null;
  sources?: ChatSource[];
  created_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: UserRole;
    full_name: string;
    avatar_url?: string | null;
    phone?: string | null;
  } | null;
  isDemo: boolean;
  isLoading: boolean;
}
