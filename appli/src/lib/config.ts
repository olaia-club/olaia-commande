/**
 * Adresses de l'appli. Elles se règlent dans appli/.env (voir .env.example) ou
 * dans les variables EAS, sans toucher au code.
 */
const nettoyer = (v: string | undefined) => (v ?? "").trim().replace(/\/+$/, "");

/** Serveur Olaía (le même que l'appli iPad) : la carte du café. */
export const OLAIA_API = nettoyer(process.env.EXPO_PUBLIC_OLAIA_API) || "https://olaia-commande.vercel.app";

/** FIMIO, où vit le Club Olaía (cartes, points, récompenses). */
export const FIMIO_BASE = nettoyer(process.env.EXPO_PUBLIC_FIMIO_BASE) || "https://www.fimio.fr";

/**
 * Identifiant du restaurant Olaía dans FIMIO (son adresse courte). Vide tant que
 * le compte FIMIO d'Olaía n'est pas prêt : l'appli dit alors que le Club arrive,
 * elle n'invente pas de carte.
 */
export const FIMIO_CLUB = (process.env.EXPO_PUBLIC_FIMIO_CLUB ?? "").trim();
