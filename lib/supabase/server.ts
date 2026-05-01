import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type PublicSchema = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          phone_encrypted: string;
          phone_hash: string;
          session_id: string;
          user_id: string | null;
          idempotency_key: string;
          source: string | null;
          lead_stage: string | null;
          top_scenarios: string[] | null;
          cluster_snapshot: string | null;
          metadata_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_encrypted: string;
          phone_hash: string;
          session_id: string;
          user_id?: string | null;
          idempotency_key: string;
          source?: string | null;
          lead_stage?: string | null;
          top_scenarios?: string[] | null;
          cluster_snapshot?: string | null;
          metadata_json?: Json | null;
          created_at?: string;
        };
        Update: Partial<PublicSchema["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      loan_insight_events: {
        Row: {
          id: string;
          event_id: string;
          session_id: string;
          user_id: string | null;
          event_name: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          session_id: string;
          user_id?: string | null;
          event_name: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: Partial<PublicSchema["public"]["Tables"]["loan_insight_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let cachedClient: SupabaseClient<PublicSchema> | null = null;

export const getSupabaseAdminClient = (): SupabaseClient<PublicSchema> | null => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cachedClient) return cachedClient;

  cachedClient = createClient<PublicSchema>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
};
