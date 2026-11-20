import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/**
 * Client serveur lié à la session de l'utilisateur (back-office).
 * Respecte les règles RLS. null si Supabase n'est pas configuré.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = supabasePublicEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : les cookies sont rafraîchis ailleurs.
        }
      },
    },
  });
}
