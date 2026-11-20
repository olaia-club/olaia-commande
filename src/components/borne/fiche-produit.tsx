"use client";

import { useEffect, useState } from "react";

import type { GroupeOptions, Plat } from "@/lib/zelty/lecture";

import { prix } from "./format";
import { prixUnitaire, type ChoixPanier } from "./panier-context";
import { PhotoPlat } from "./photo-plat";

type Props = {
  plat: Plat;
  categorie: string | null;
  groupes: GroupeOptions[];
  onFermer: () => void;
  onAjouter: (choix: ChoixPanier[], quantite: number) => void;
};

/** Fiche d'un plat : description, options lues dans Zelty, quantité. */
export function FicheProduit({ plat, categorie, groupes, onFermer, onAjouter }: Props) {
  const [choisis, setChoisis] = useState<Record<string, string[]>>({});
  const [quantite, setQuantite] = useState(1);

  useEffect(() => {
    const echap = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [onFermer]);

  const basculer = (g: GroupeOptions, choixId: string) =>
    setChoisis((avant) => {
      const actuels = avant[g.id] ?? [];
      if (actuels.includes(choixId)) return { ...avant, [g.id]: actuels.filter((c) => c !== choixId) };
      if (g.max === 1) return { ...avant, [g.id]: [choixId] };
      if (actuels.length >= g.max) return avant;
      return { ...avant, [g.id]: [...actuels, choixId] };
    });

  const selection: ChoixPanier[] = groupes.flatMap((g) =>
    (choisis[g.id] ?? []).map((id) => {
      const c = g.choix.find((x) => x.id === id)!;
      return { groupeId: g.id, choixId: c.id, nom: c.nom, supplement: c.supplement };
    }),
  );
  const manquants = groupes.filter((g) => (choisis[g.id]?.length ?? 0) < g.min);
  const unitaire = prixUnitaire({ prixBase: plat.prix, choix: selection });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-marron-fonce/40 p-[60px] backdrop-blur-[2px]" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fiche-titre"
        className="flex h-full max-h-[700px] w-full max-w-[980px] overflow-hidden rounded-[32px] bg-papier shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PhotoPlat src={plat.photo} alt={plat.nom} className="h-full w-[38%] shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain px-10 pt-9 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                {categorie && <p className="text-base font-semibold text-marron-doux">{categorie}</p>}
                <h2 id="fiche-titre" className="font-serif text-5xl leading-tight">
                  {plat.nom}
                </h2>
              </div>
              <button type="button" onClick={onFermer} aria-label="Fermer" className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-trait active:bg-sable">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {plat.description && <p className="mt-3 text-lg leading-relaxed text-marron-doux">{plat.description}</p>}
            <p className="mt-3 text-sm font-semibold text-marron-doux">Une allergie&nbsp;? Demande à l&apos;équipe avant de commander.</p>

            {groupes.map((g) => {
              const actuels = choisis[g.id] ?? [];
              return (
                <fieldset key={g.id} className="mt-7">
                  <legend className="flex w-full items-baseline justify-between">
                    <span className="font-serif text-2xl">{g.nom}</span>
                    <span className="text-sm font-semibold text-marron-doux">
                      {g.min === 0 ? (g.max === 1 ? "Facultatif" : `Jusqu'à ${g.max}, facultatif`) : g.min === g.max ? (g.min === 1 ? "1 choix" : `${g.min} choix`) : `${g.min} à ${g.max} choix`}
                    </span>
                  </legend>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {g.choix.map((c) => {
                      const actif = actuels.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={actif}
                          onClick={() => basculer(g, c.id)}
                          className={`flex min-h-[68px] flex-col items-start justify-center rounded-2xl border-2 px-4 py-2 text-left transition-colors ${
                            actif ? "border-marron bg-marron text-papier" : "border-trait bg-papier active:bg-sable"
                          }`}
                        >
                          <span className="text-lg leading-tight font-medium">{c.nom}</span>
                          <span className={`text-sm font-semibold ${actif ? "text-papier/80" : "text-marron-doux"}`}>
                            {c.supplement ? `+${prix(c.supplement)}` : "Inclus"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-5 border-t border-trait px-10 py-6">
            <div className="flex h-[72px] items-center rounded-full border-2 border-trait p-1.5">
              <button type="button" aria-label="Un de moins" disabled={quantite <= 1} onClick={() => setQuantite((q) => Math.max(1, q - 1))} className="flex size-14 items-center justify-center rounded-full bg-sable/60 text-3xl disabled:opacity-35">
                −
              </button>
              <span className="w-12 text-center text-2xl font-semibold" aria-live="polite">
                {quantite}
              </span>
              <button type="button" aria-label="Un de plus" disabled={quantite >= 20} onClick={() => setQuantite((q) => Math.min(20, q + 1))} className="flex size-14 items-center justify-center rounded-full bg-sable/60 text-3xl disabled:opacity-35">
                +
              </button>
            </div>
            <button
              type="button"
              disabled={manquants.length > 0}
              onClick={() => onAjouter(selection, quantite)}
              className="h-[72px] flex-1 rounded-full bg-marron px-6 text-xl font-semibold text-papier disabled:bg-marron/35"
            >
              {manquants.length ? `Choisis : ${manquants.map((g) => g.nom.toLowerCase()).join(", ")}` : `Ajouter · ${prix(unitaire * quantite)} €`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
