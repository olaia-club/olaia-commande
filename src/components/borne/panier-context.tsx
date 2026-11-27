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

/** Le membre du Club retrouvé dans FIMIO pour cette commande, s'il y en a un. */
type Etat = { lignes: LignePanier[]; membre: MembreClub | null };

type Action =
  | { type: "ajouter"; ligne: Omit<LignePanier, "cle" | "quantite">; quantite: number }
  | { type: "quantite"; cle: string; quantite: number }
  | { type: "membre"; membre: MembreClub | null }
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
      return { lignes: [], membre: null };
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
  vider: () => void;
};

const PanierContexte = createContext<Panier | null>(null);

export function PanierProvider({ children }: { children: ReactNode }) {
  const [etat, envoyer] = useReducer(reducteur, { lignes: [], membre: null });
  const valeur = useMemo<Panier>(
    () => ({
      lignes: etat.lignes,
      nbArticles: etat.lignes.reduce((n, l) => n + l.quantite, 0),
      total: somme(etat.lignes.map((l) => prixUnitaire(l) * l.quantite)),
      ajouter: (ligne, quantite) => envoyer({ type: "ajouter", ligne, quantite }),
      changerQuantite: (cle, quantite) => envoyer({ type: "quantite", cle, quantite }),
      membre: etat.membre,
      choisirMembre: (membre) => envoyer({ type: "membre", membre }),
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
