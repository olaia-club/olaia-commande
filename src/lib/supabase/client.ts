"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/** Client navigateur (clé anon seulement). null si Supabase n'est pas configuré. */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  const env = supabasePublicEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
}
