import { FIMIO_BASE, FIMIO_CLUB } from "./config";

/**
 * L'API Club de FIMIO, faite pour l'appli d'un restaurant (la même que l'appli
 * GREEKIA) : connexion par un code reçu par SMS, la carte, les points, les
 * récompenses. FIMIO garde les cartes : l'appli ne garde que le jeton de session.
 *
 *   GET    /api/club/<club>             moyens de connexion ouverts { sms, email }
 *   POST   /api/club/<club>/code        { kind, valeur } → { envoyeA }
 *   POST   /api/club/<club>/connexion   { kind, valeur, code, appareil } → { jeton, membre, nouveau }
 *   GET    /api/club/<club>/moi         la carte
 *   PATCH  /api/club/<club>/moi         { prenom?, optins? } → { membre }
 *   DELETE /api/club/<club>/moi         supprime le compte
 *   POST   /api/club/<club>/deconnexion
 *   POST   /api/club/<club>/recompense  { id } → { bon, solde }
 *   GET    /api/club/<club>/wallet      { apple, google }
 * Erreurs : { erreur } en français.
 */

export type Membre = {
  id: string;
  /** Numéro de la carte, « 1234-5678 » : c'est lui que l'iPad lit dans le QR. */
  carte: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  optins: { offresEmail: boolean; offresSms: boolean; notifications: boolean };
  depuis: number;
  points: number;
  profil_complet: boolean;
};

export type Mouvement = { id: string; libelle: string; delta: number; genre: string; date: string };

export type Bon = {
  id: string;
  code: string;
  genre: "recompense" | "jeu";
  libelle: string;
  points: number;
  expire_le: string | null;
  servi_le: string | null;
  annule_le: string | null;
  cree_le: string;
};

export type Recompense = { id: string; libelle: string; points: number };

export type CarteClub = {
  membre: Membre;
  plafond: number;
  historique: Mouvement[];
  bons: Bon[];
  recompenses: Recompense[];
};

export class ErreurClub extends Error {
  constructor(
    message: string,
    readonly statut: number,
  ) {
    super(message);
  }
}

export const clubRelie = () => FIMIO_CLUB !== "";

async function appel<T>(chemin: string, init: RequestInit & { jeton?: string | null } = {}): Promise<T> {
  if (!clubRelie()) throw new ErreurClub("Le Club Olaía arrive bientôt dans l'appli.", 503);
  const { jeton, ...reste } = init;
  let r: Response;
  try {
    r = await fetch(`${FIMIO_BASE}/api/club/${encodeURIComponent(FIMIO_CLUB)}${chemin}`, {
      ...reste,
      headers: {
        Accept: "application/json",
        ...(reste.body ? { "Content-Type": "application/json" } : {}),
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
    });
  } catch {
    throw new ErreurClub("Pas de connexion. Vérifie ton réseau et réessaie.", 0);
  }
  const corps = (await r.json().catch(() => null)) as (T & { erreur?: unknown }) | null;
  if (!r.ok) throw new ErreurClub(typeof corps?.erreur === "string" ? corps.erreur : "Le Club ne répond pas pour le moment.", r.status);
  return corps as T;
}

/** Portable français (06, 07, +33…), au format attendu par FIMIO. */
export function portable(saisie: string): string | null {
  const chiffres = saisie.replace(/[^\d+]/g, "");
  const national = chiffres.startsWith("+33") ? `0${chiffres.slice(3)}` : chiffres.startsWith("0033") ? `0${chiffres.slice(4)}` : chiffres;
  return /^0[67]\d{8}$/.test(national) ? `+33${national.slice(1)}` : null;
}

/** "0612345678" → "06 12 34 56 78". */
export const portableLisible = (saisie: string) =>
  saisie.replace(/\D/g, "").slice(0, 10).replace(/(\d{2})(?=\d)/g, "$1 ");

export const moyensDeConnexion = () => appel<{ sms: boolean; email: boolean }>("");

export const demanderCode = (telephone: string) =>
  appel<{ envoyeA: string }>("/code", { method: "POST", body: JSON.stringify({ kind: "phone", valeur: telephone }) });

export const seConnecter = (telephone: string, code: string, appareil: string) =>
  appel<{ jeton: string; membre: Membre; nouveau: boolean }>("/connexion", {
    method: "POST",
    body: JSON.stringify({ kind: "phone", valeur: telephone, code, appareil }),
  });

export const lireCarteClub = (jeton: string) => appel<CarteClub>("/moi", { jeton });

export const modifierProfil = (jeton: string, modif: { prenom?: string; optins?: Partial<Membre["optins"]> }) =>
  appel<{ membre: Membre }>("/moi", { method: "PATCH", jeton, body: JSON.stringify(modif) });

export const supprimerCompte = (jeton: string) => appel<{ ok: true }>("/moi", { method: "DELETE", jeton });

export const seDeconnecter = (jeton: string) => appel<{ ok: true }>("/deconnexion", { method: "POST", jeton });

export const echangerRecompense = (jeton: string, id: string) =>
  appel<{ bon: Bon; solde: number }>("/recompense", { method: "POST", jeton, body: JSON.stringify({ id }) });

export const etatWallet = (jeton: string) => appel<{ apple: boolean; google: boolean }>("/wallet", { jeton });
