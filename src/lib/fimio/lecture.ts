/**
 * Lecture des réponses de l'API borne de FIMIO (format « fournisseur de
 * fidélité » Deliverect, exposé par FIMIO sous /api/borne/deliverect/…).
 * Fonctions pures : pas de réseau ici, seulement la forme des données.
 *
 * On ne garde que ce que l'écran affiche : le prénom, le solde et les
 * récompenses. Le téléphone, le nom et l'e-mail ne repartent jamais vers l'iPad.
 */

export type MembreClub = {
  id: string;
  prenom: string;
  /** Mode points : solde en points. Mode cagnotte : solde en centimes. */
  mode: "points" | "cagnotte";
  solde: number;
};

export type RecompenseClub = { id: string; nom: string; cout: number };

type Json = Record<string, unknown>;
const objet = (v: unknown): Json => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {});
const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const nombre = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Portable français tapé sur le pavé (06…, 07…), au format attendu par FIMIO. */
export function telephoneClub(chiffres: string): string | null {
  const v = chiffres.replace(/\D/g, "");
  return /^0[67]\d{8}$/.test(v) ? `+33${v.slice(1)}` : null;
}

/** "0612345678" → "06 12 34 56 78", pour l'affichage pendant la saisie. */
export function telephoneLisible(chiffres: string): string {
  return chiffres.replace(/\D/g, "").slice(0, 10).replace(/(\d{2})(?=\d)/g, "$1 ");
}

export function lireMembre(brut: unknown): MembreClub | null {
  const b = objet(brut);
  const id = texte(b.id) || texte(b.loyaltyCustomerId);
  if (!id) return null;
  const cash = nombre(objet(b.cash).balanceAmount);
  const points = nombre(objet(b.points).balance) ?? 0;
  return {
    id,
    prenom: texte(b.firstName).slice(0, 40),
    mode: cash !== null ? "cagnotte" : "points",
    solde: Math.max(0, cash ?? points),
  };
}

export function lireRecompenses(brut: unknown): RecompenseClub[] {
  const liste = objet(brut).programs;
  if (!Array.isArray(liste)) return [];
  return liste
    .map((p) => {
      const o = objet(p);
      const cout = nombre(o.pointsCost) ?? nombre(o.points);
      return { id: texte(o.id), nom: texte(o.name), cout: cout ?? -1 };
    })
    .filter((r) => r.id && r.nom && r.cout >= 0)
    .sort((a, b) => a.cout - b.cout);
}
