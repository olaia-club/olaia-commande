"use server";

import QRCode from "qrcode";

import {
  ErreurClub,
  clubConfigure,
  creerMembre,
  envoyerCarteParSms,
  recompenses,
  trouverMembre,
  trouverParCarte,
  type CarteTrouvee,
} from "@/lib/fimio/club";
import { telephoneClub, valeurScan, type MembreClub, type RecompenseClub } from "@/lib/fimio/lecture";

/**
 * Appelées par l'écran Club de la borne. Elles ne renvoient que le prénom, le
 * solde et les récompenses : jamais le téléphone, le nom ou l'e-mail du membre.
 */
export type ReponseClub =
  | {
      etat: "membre";
      membre: MembreClub;
      recompenses: RecompenseClub[];
      nouveau: boolean;
      /** QR (SVG) de la carte, à scanner avec son téléphone pour l'ajouter au Wallet. Carte créée à l'instant seulement. */
      qrWallet: string | null;
      /** FIMIO peut envoyer la carte par SMS au numéro de la carte. */
      carteParSms: boolean;
    }
  | { etat: "inconnu" }
  | { etat: "invalide"; message: string }
  | { etat: "indisponible"; message: string };

const indisponible = (e: unknown): ReponseClub => {
  console.error("[club] FIMIO", e instanceof Error ? e.message : e);
  if (e instanceof ErreurClub && e.statut === 503 && !clubConfigure()) return { etat: "indisponible", message: "Le Club n'est pas encore relié à FIMIO." };
  return { etat: "indisponible", message: "Le Club ne répond pas pour le moment. Tu peux commander sans, tes points ne seront pas comptés cette fois." };
};

const qr = (url: string) => QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#541f09", light: "#0000" } });

const reponse = async ({ membre, wallet }: CarteTrouvee, nouveau: boolean): Promise<ReponseClub> => ({
  etat: "membre",
  membre,
  nouveau,
  // Sans la liste des récompenses, la carte reste utilisable.
  recompenses: membre.mode === "points" ? await recompenses().catch(() => []) : [],
  qrWallet: nouveau && wallet.url ? await qr(wallet.url).catch(() => null) : null,
  carteParSms: wallet.parSms,
});

const NUMERO = "Un numéro de portable en 06 ou 07, sur 10 chiffres.";

export async function chercherMembre(chiffres: string): Promise<ReponseClub> {
  const telephone = telephoneClub(String(chiffres ?? ""));
  if (!telephone) return { etat: "invalide", message: NUMERO };
  try {
    const carte = await trouverMembre(telephone);
    return carte ? await reponse(carte, false) : { etat: "inconnu" };
  } catch (e) {
    return indisponible(e);
  }
}

/** Le QR montré à la caméra : celui de la carte Wallet ou de la carte web FIMIO. */
export async function chercherParScan(lu: string): Promise<ReponseClub> {
  const valeur = valeurScan(String(lu ?? ""));
  if (!valeur) return { etat: "invalide", message: "Ce QR code n'est pas une carte du Club." };
  try {
    const carte = await trouverParCarte(valeur);
    return carte ? await reponse(carte, false) : { etat: "invalide", message: "Carte introuvable. Tape ton numéro à la place." };
  } catch (e) {
    return indisponible(e);
  }
}

export async function inscrireMembre(chiffres: string, prenom: string, optInSms: boolean): Promise<ReponseClub> {
  const telephone = telephoneClub(String(chiffres ?? ""));
  const nom = String(prenom ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!telephone) return { etat: "invalide", message: NUMERO };
  if (!nom) return { etat: "invalide", message: "Ton prénom, pour qu'on t'appelle au comptoir." };
  try {
    return await reponse(await creerMembre(telephone, nom, optInSms === true), true);
  } catch (e) {
    // Déjà membre (inscrit entre-temps) : on reprend sa carte.
    if (e instanceof ErreurClub && e.statut === 409) return chercherMembre(chiffres);
    return indisponible(e);
  }
}

export type ReponseSms = { ok: true } | { ok: false; message: string };

/** Le lien de la carte par SMS, envoyé par FIMIO au numéro de la carte. */
export async function envoyerCarte(membreId: string): Promise<ReponseSms> {
  if (!/^[0-9a-f-]{36}$/i.test(String(membreId ?? ""))) return { ok: false, message: "Carte inconnue." };
  try {
    await envoyerCarteParSms(membreId);
    return { ok: true };
  } catch (e) {
    console.error("[club] SMS carte", e instanceof Error ? e.message : e);
    if (e instanceof ErreurClub && e.statut === 409) return { ok: false, message: "Un SMS vient déjà de partir. Regarde tes messages." };
    if (e instanceof ErreurClub && e.statut === 503) return { ok: false, message: "L'envoi de SMS n'est pas encore branché." };
    return { ok: false, message: "Le SMS n'a pas pu partir. Réessaie dans un instant." };
  }
}
