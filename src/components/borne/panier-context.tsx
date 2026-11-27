"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

import type { MembreClub } from "@/lib/fimio/lecture";

import { somme } from "./format";

export type ChoixPanier = { groupeId: string; choixId: string; nom: string; supplement: number };

export type LignePanier = {
  /** Plat + choix : deux lignes identiques sont fusionnées. */
  cle: string;
  platId: string;
  nom: string;
  photo: string | null;
  prixBase: number;
  choix: ChoixPanier[];
  quantite: number;
};

export type ModeCommande = "sur-place" | "a-emporter";

/** Ce que l'écran de fin affiche, figé au moment où la commande part. */
export type FinCommande = {
  mode: ModeCommande;
  total: number;
  nbArticles: number;
  membre: MembreClub | null;
  /** Numéro donné par Zelty ; null tant que l'envoi à Zelty n'est pas branché. */
  numero: string | null;
  /** Aperçu de l'écran : la commande n'est ni envoyée ni encaissée. */
  apercu: boolean;
};

/** Le membre du Club retrouvé dans FIMIO pour cette commande, s'il y en a un. */
type Etat = { lignes: LignePanier[]; membre: MembreClub | null; fin: FinCommande | null };

type Action =
  | { type: "ajouter"; ligne: Omit<LignePanier, "cle" | "quantite">; quantite: number }
  | { type: "quantite"; cle: string; quantite: number }
  | { type: "membre"; membre: MembreClub | null }
  | { type: "terminer"; fin: FinCommande }
  | { type: "vider" };

export const cleLigne = (platId: string, choix: ChoixPanier[]) =>
  [platId, ...choix.map((c) => `${c.groupeId}:${c.choixId}`).sort()].join("|");

export const prixUnitaire = (l: Pick<LignePanier, "prixBase" | "choix">) => somme([l.prixBase, ...l.choix.map((c) => c.supplement)]);

function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case "ajouter": {
      const cle = cleLigne(action.ligne.platId, action.ligne.choix);
      const existe = etat.lignes.find((l) => l.cle === cle);
      if (existe) {
        return { ...etat, lignes: etat.lignes.map((l) => (l.cle === cle ? { ...l, quantite: Math.min(20, l.quantite + action.quantite) } : l)) };
      }
      return { ...etat, lignes: [...etat.lignes, { ...action.ligne, cle, quantite: action.quantite }] };
    }
    case "quantite":
      return {
        ...etat,
        lignes:
          action.quantite <= 0
            ? etat.lignes.filter((l) => l.cle !== action.cle)
            : etat.lignes.map((l) => (l.cle === action.cle ? { ...l, quantite: Math.min(20, action.quantite) } : l)),
      };
    case "membre":
      return { ...etat, membre: action.membre };
    case "vider":
      // Client suivant : ni panier ni carte du Club.
      return { lignes: [], membre: null, fin: null };
    case "terminer":
      // Le panier est vidé tout de suite : l'écran de fin garde seulement le résumé.
      return { lignes: [], membre: null, fin: action.fin };
  }
}

type Panier = {
  lignes: LignePanier[];
  nbArticles: number;
  total: number;
  ajouter: (ligne: Omit<LignePanier, "cle" | "quantite">, quantite: number) => void;
  changerQuantite: (cle: string, quantite: number) => void;
  membre: MembreClub | null;
  choisirMembre: (membre: MembreClub | null) => void;
  fin: FinCommande | null;
  terminer: (fin: Omit<FinCommande, "total" | "nbArticles" | "membre">) => void;
  vider: () => void;
};

const PanierContexte = createContext<Panier | null>(null);

export function PanierProvider({ children }: { children: ReactNode }) {
  const [etat, envoyer] = useReducer(reducteur, { lignes: [], membre: null, fin: null });
  const valeur = useMemo<Panier>(
    () => ({
      lignes: etat.lignes,
      nbArticles: etat.lignes.reduce((n, l) => n + l.quantite, 0),
      total: somme(etat.lignes.map((l) => prixUnitaire(l) * l.quantite)),
      ajouter: (ligne, quantite) => envoyer({ type: "ajouter", ligne, quantite }),
      changerQuantite: (cle, quantite) => envoyer({ type: "quantite", cle, quantite }),
      membre: etat.membre,
      choisirMembre: (membre) => envoyer({ type: "membre", membre }),
      fin: etat.fin,
      terminer: (fin) => {
        const nbArticles = etat.lignes.reduce((n, l) => n + l.quantite, 0);
        const total = somme(etat.lignes.map((l) => prixUnitaire(l) * l.quantite));
        envoyer({ type: "terminer", fin: { ...fin, total, nbArticles, membre: etat.membre } });
      },
      vider: () => envoyer({ type: "vider" }),
    }),
    [etat],
  );
  return <PanierContexte.Provider value={valeur}>{children}</PanierContexte.Provider>;
}

export function usePanier(): Panier {
  const p = useContext(PanierContexte);
  if (!p) throw new Error("usePanier doit être utilisé dans <PanierProvider>.");
  return p;
}
