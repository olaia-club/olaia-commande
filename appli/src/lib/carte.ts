import { OLAIA_API } from "./config";

/** La carte du café, lue par le serveur Olaía dans Zelty (la même que sur l'iPad). */
export type Plat = {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  photo: string | null;
  categories: string[];
};

export type Categorie = { id: string; nom: string };

export type EtatCarte =
  | { etat: "ok" | "exemple"; categories: Categorie[]; plats: Plat[] }
  | { etat: "vide" }
  | { etat: "erreur"; message: string };

export async function chargerCarte(): Promise<EtatCarte> {
  try {
    const r = await fetch(`${OLAIA_API}/api/appli/carte`, { headers: { Accept: "application/json" } });
    const corps = (await r.json().catch(() => null)) as EtatCarte | null;
    if (corps && (corps.etat === "ok" || corps.etat === "exemple" || corps.etat === "vide" || corps.etat === "erreur")) return corps;
    return { etat: "erreur", message: "La carte ne répond pas pour le moment." };
  } catch {
    return { etat: "erreur", message: "Pas de connexion. Vérifie ton réseau et réessaie." };
  }
}

export const prix = (euros: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(euros);
