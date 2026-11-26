"use server";

import { ErreurClub, clubConfigure, creerMembre, recompenses, trouverMembre } from "@/lib/fimio/club";
import { telephoneClub, type MembreClub, type RecompenseClub } from "@/lib/fimio/lecture";

/**
 * Appelées par l'écran Club de la borne. Elles ne renvoient que le prénom, le
 * solde et les récompenses : jamais le téléphone, le nom ou l'e-mail du membre.
 */
export type ReponseClub =
  | { etat: "membre"; membre: MembreClub; recompenses: RecompenseClub[]; nouveau: boolean }
  | { etat: "inconnu" }
  | { etat: "invalide"; message: string }
  | { etat: "indisponible"; message: string };

const indisponible = (e: unknown): ReponseClub => {
  console.error("[club] FIMIO", e instanceof Error ? e.message : e);
  if (e instanceof ErreurClub && e.statut === 503 && !clubConfigure()) return { etat: "indisponible", message: "Le Club n'est pas encore relié à FIMIO." };
  return { etat: "indisponible", message: "Le Club ne répond pas pour le moment. Tu peux commander sans, tes points ne seront pas comptés cette fois." };
};

const avecRecompenses = async (membre: MembreClub, nouveau: boolean): Promise<ReponseClub> => ({
  etat: "membre",
  membre,
  nouveau,
  // Sans la liste des récompenses, la carte reste utilisable.
  recompenses: membre.mode === "points" ? await recompenses().catch(() => []) : [],
});

export async function chercherMembre(chiffres: string): Promise<ReponseClub> {
  const telephone = telephoneClub(String(chiffres ?? ""));
  if (!telephone) return { etat: "invalide", message: "Un numéro de portable en 06 ou 07, sur 10 chiffres." };
  try {
    const membre = await trouverMembre(telephone);
    return membre ? await avecRecompenses(membre, false) : { etat: "inconnu" };
  } catch (e) {
    return indisponible(e);
  }
}

export async function inscrireMembre(chiffres: string, prenom: string, optInSms: boolean): Promise<ReponseClub> {
  const telephone = telephoneClub(String(chiffres ?? ""));
  const nom = String(prenom ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!telephone) return { etat: "invalide", message: "Un numéro de portable en 06 ou 07, sur 10 chiffres." };
  if (!nom) return { etat: "invalide", message: "Ton prénom, pour qu'on t'appelle au comptoir." };
  try {
    return await avecRecompenses(await creerMembre(telephone, nom, optInSms === true), true);
  } catch (e) {
    // Déjà membre (inscrit entre-temps) : on reprend sa carte.
    if (e instanceof ErreurClub && e.statut === 409) return chercherMembre(chiffres);
    return indisponible(e);
  }
}
