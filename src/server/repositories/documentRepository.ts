import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KnowledgeDocument } from "@/types";

export class DocumentRepository {
  async getPublishedDocuments(): Promise<KnowledgeDocument[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as KnowledgeDocument[];
      }
    } catch {
      // Fallback in case of network / initialization issues
    }

    return [];
  }

  async getAllDocumentsForAdmin(): Promise<KnowledgeDocument[]> {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as KnowledgeDocument[];
      }
    } catch {
      // Fallback in case of network / initialization issues
    }

    return [];
  }
}

export const documentRepository = new DocumentRepository();
