import "server-only";

import { lireCarteWallet, lireMembre, lireRecompenses, type CarteWallet, type MembreClub, type RecompenseClub } from "./lecture";

/**
 * Le Club Olaía vit dans FIMIO, un logiciel à part : la borne ne garde aucune
 * carte, aucun point. Elle parle à l'API borne de FIMIO avec la clé que le
 * gérant génère dans FIMIO (Fidélité → Borne). Une seule variable à remplir :
 * FIMIO_BORNE_CLE. FIMIO renvoie alors les adresses propres au restaurant.
 */
const FIMIO_BASE = (process.env.FIMIO_BASE || "https://www.fimio.fr").replace(/\/+$/, "");
const COMPTE = "olaia-borne";

export class ErreurClub extends Error {
  constructor(
    message: string,
    readonly statut: number,
  ) {
    super(message);
  }
}

export const clubConfigure = () => Boolean(process.env.FIMIO_BORNE_CLE?.trim());

const cle = () => {
  const c = process.env.FIMIO_BORNE_CLE?.trim();
  if (!c) throw new ErreurClub("Club pas encore relié à FIMIO.", 503);
  return c;
};

async function appel(url: string, init: RequestInit = {}): Promise<unknown> {
  const r = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-api-key": cle(), ...init.headers },
  });
  const corps = await r.json().catch(() => null);
  if (!r.ok) throw new ErreurClub(String((corps as { error?: unknown } | null)?.error ?? `FIMIO : HTTP ${r.status}`), r.status);
  return corps;
}

type Adresses = { customerURL: string; loyaltyProgramsURL: string; orderURL: string };
export type CarteTrouvee = { membre: MembreClub; wallet: CarteWallet };
let adresses: Promise<Adresses> | null = null;

/** Inscription auprès de FIMIO, une fois par instance du serveur. */
function lesAdresses(): Promise<Adresses> {
  adresses ??= (async () => {
    const r = (await appel(`${FIMIO_BASE}/api/borne/deliverect/register`, {
      method: "POST",
      body: JSON.stringify({ account: COMPTE, apiKey: cle() }),
    })) as Partial<Adresses> | null;
    if (!r?.customerURL || !r.loyaltyProgramsURL || !r.orderURL) throw new ErreurClub("FIMIO n'a pas renvoyé les adresses de la borne.", 502);
    return { customerURL: r.customerURL, loyaltyProgramsURL: r.loyaltyProgramsURL, orderURL: r.orderURL };
  })().catch((e) => {
    adresses = null; // on réessaiera au prochain appel
    throw e;
  });
  return adresses;
}

const carte = (brut: unknown): CarteTrouvee | null => {
  const membre = lireMembre(brut);
  return membre ? { membre, wallet: lireCarteWallet(brut) } : null;
};

async function chercher(parametre: "phoneNumber" | "cardToken", valeur: string): Promise<CarteTrouvee | null> {
  const { customerURL } = await lesAdresses();
  try {
    return carte(await appel(`${customerURL}?${parametre}=${encodeURIComponent(valeur)}`));
  } catch (e) {
    if (e instanceof ErreurClub && e.statut === 404) return null;
    throw e;
  }
}

/** La carte d'un client par son portable, ou null s'il n'est pas membre. */
export const trouverMembre = (telephone: string) => chercher("phoneNumber", telephone);

/** La carte d'un client par le QR de sa carte Wallet (ou web), ou son numéro. */
export const trouverParCarte = (scan: string) => chercher("cardToken", scan);

/** Crée la carte (bonus de bienvenue appliqué par FIMIO). */
export async function creerMembre(telephone: string, prenom: string, optInSms: boolean): Promise<CarteTrouvee> {
  const { customerURL } = await lesAdresses();
  const cree = carte(
    await appel(customerURL, { method: "POST", body: JSON.stringify({ phoneNumber: telephone, firstName: prenom, smsOptIn: optInSms }) }),
  );
  if (!cree) throw new ErreurClub("FIMIO n'a pas renvoyé la carte créée.", 502);
  return cree;
}

/**
 * FIMIO envoie le lien de la carte par SMS, au numéro enregistré sur la carte
 * (jamais à un autre) : le client l'ouvre et ajoute la carte à son Wallet.
 */
export async function envoyerCarteParSms(membreId: string): Promise<void> {
  const { customerURL } = await lesAdresses();
  await appel(customerURL.replace(/\/customer$/, "/customerCard"), { method: "POST", body: JSON.stringify({ customerId: membreId }) });
}

/** Les récompenses du programme, de la moins chère à la plus chère. */
export async function recompenses(): Promise<RecompenseClub[]> {
  const { loyaltyProgramsURL } = await lesAdresses();
  return lireRecompenses(await appel(loyaltyProgramsURL));
}

/**
 * À appeler une fois la commande payée (pas encore : le paiement n'est pas
 * branché). FIMIO crédite les points et ignore un deuxième envoi de la même
 * commande. Montant en centimes.
 */
export async function crediterCommande(commande: { ref: string; centimes: number; membreId: string }): Promise<{ pointsGagnes: number }> {
  const { orderURL } = await lesAdresses();
  const r = (await appel(orderURL, {
    method: "POST",
    body: JSON.stringify({ orderId: commande.ref, customerId: commande.membreId, payment: { amount: commande.centimes }, decimalDigits: 2 }),
  })) as { pointsEarned?: unknown } | null;
  return { pointsGagnes: typeof r?.pointsEarned === "number" ? r.pointsEarned : 0 };
}
