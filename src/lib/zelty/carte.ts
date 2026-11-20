import "server-only";

import { cacheLife } from "next/cache";

import { CARTE_EXEMPLE } from "@/lib/carte-exemple";

import { assemblerCatalogue, type Catalogue } from "./lecture";

/**
 * Lecture de la carte dans Zelty, la seule source de la carte, des prix et des
 * ruptures. La borne lit, elle n'écrit jamais dans Zelty.
 *
 * Version de l'API : celle utilisée en production chez GREEKIA (2.5). Elle se
 * change avec ZELTY_API_BASE sans toucher au code.
 */
const ZELTY_BASE = process.env.ZELTY_API_BASE || "https://api.zelty.fr/2.5";

export type EtatCarte =
  | { etat: "ok"; catalogue: Catalogue }
  /** Pas de clé Zelty : carte d'exemple, affichée comme telle sur la borne. */
  | { etat: "exemple"; catalogue: Catalogue }
  | { etat: "vide" }
  | { etat: "erreur"; message: string };

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET Zelty avec réessais quand Zelty limite le débit (HTTP 429). */
async function zeltyGet(chemin: string, cle: string): Promise<unknown> {
  for (let essai = 0; essai < 4; essai++) {
    const r = await fetch(`${ZELTY_BASE}/${chemin}`, {
      headers: { Authorization: `Bearer ${cle}`, Accept: "application/json" },
    });
    if (r.status === 429) {
      await attendre(1200 * (essai + 1));
      continue;
    }
    if (!r.ok) throw new Error(`Zelty ${chemin.split("?")[0]} : HTTP ${r.status}`);
    return r.json();
  }
  throw new Error("Zelty limite les appels (HTTP 429), réessaie dans une minute.");
}

/**
 * Catalogue mis en cache une minute : une rupture posée dans Zelty disparaît
 * de l'iPad en une à deux minutes. Une erreur n'est pas mise en cache.
 */
async function chargerCatalogue(cle: string, restaurant: string | null): Promise<Catalogue> {
  "use cache";
  cacheLife("minutes");
  const q = restaurant ? `?id_restaurant=${encodeURIComponent(restaurant)}` : "";
  const [plats, tags, options] = await Promise.all([
    zeltyGet(`catalog/dishes${q}`, cle),
    // Sans catégories ni options, la carte reste utilisable : pas bloquant.
    zeltyGet(`catalog/tags${q}`, cle).catch(() => null),
    zeltyGet(`catalog/options${q}`, cle).catch(() => null),
  ]);
  return assemblerCatalogue(plats, tags, options);
}

/**
 * La carte de la borne : celle de Zelty dès que la clé est là. Sans clé, la
 * carte d'exemple (demandée pour tester), signalée comme telle à l'écran.
 */
export async function lireCarte(): Promise<EtatCarte> {
  const cle = process.env.ZELTY_API_KEY;
  if (!cle) return { etat: "exemple", catalogue: CARTE_EXEMPLE };
  try {
    const catalogue = await chargerCatalogue(cle, process.env.ZELTY_RESTAURANT_ID || null);
    return catalogue.plats.length ? { etat: "ok", catalogue } : { etat: "vide" };
  } catch (e) {
    return { etat: "erreur", message: e instanceof Error ? e.message : String(e) };
  }
}
