/**
 * Variables Supabase. Écrites en entier pour que Next.js les intègre au bundle client.
 * Renvoie null tant que le projet Supabase n'est pas branché : aucun écran ne doit
 * alors faire semblant d'avoir des données.
 */
export function supabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
