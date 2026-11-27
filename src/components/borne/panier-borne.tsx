"use client";

import Link from "next/link";
import { useState } from "react";

import { ClubBorne } from "@/components/borne/club-borne";
import { Entete } from "@/components/borne/entete";
import { articles, prix, prixEuro } from "@/components/borne/format";
import { prixUnitaire, usePanier, type ModeCommande } from "@/components/borne/panier-context";
import { PhotoPlat } from "@/components/borne/photo-plat";

export function PanierBorne({ clubConfigure }: { clubConfigure: boolean }) {
  const panier = usePanier();
  const [mode, setMode] = useState<ModeCommande | null>(null);

  if (!panier.nbArticles) {
    return (
      <>
        <Entete />
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <h1 className="font-serif text-6xl">Ta commande est vide</h1>
          <Link href="/borne/carte" className="flex h-[72px] items-center rounded-full bg-marron px-10 text-xl font-semibold text-papier">
            Voir la carte
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Entete />
      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col px-10 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-serif text-6xl leading-none">Ta commande</h1>
              <p className="mt-2 text-lg text-marron-doux">{articles(panier.nbArticles)}</p>
            </div>
            <Link href="/borne/carte" className="flex h-14 items-center gap-2 rounded-full border-2 border-trait px-6 text-base font-semibold active:bg-sable">
              + Ajouter autre chose
            </Link>
          </div>

          <ul className="mt-6 min-h-0 flex-1 divide-y divide-trait overflow-y-auto overscroll-contain border-t border-trait pb-6">
            {panier.lignes.map((l) => (
              <li key={l.cle} className="flex items-center gap-5 py-4">
                <PhotoPlat src={l.photo} alt="" className="size-20 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-3xl leading-tight">{l.nom}</p>
                  {l.choix.length > 0 && <p className="mt-0.5 text-base text-marron-doux">{l.choix.map((c) => c.nom).join(" · ")}</p>}
                </div>
                <div className="flex h-16 items-center rounded-full border-2 border-trait p-1">
                  <button
                    type="button"
                    aria-label={l.quantite === 1 ? `Retirer ${l.nom}` : `Un ${l.nom} de moins`}
                    onClick={() => panier.changerQuantite(l.cle, l.quantite - 1)}
                    className="flex size-[52px] items-center justify-center rounded-full text-2xl active:bg-sable"
                  >
                    {l.quantite === 1 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                      </svg>
                    ) : (
                      "−"
                    )}
                  </button>
                  <span className="w-10 text-center text-xl font-semibold">{l.quantite}</span>
                  <button
                    type="button"
                    aria-label={`Un ${l.nom} de plus`}
                    disabled={l.quantite >= 20}
                    onClick={() => panier.changerQuantite(l.cle, l.quantite + 1)}
                    className="flex size-[52px] items-center justify-center rounded-full text-2xl active:bg-sable disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
                <span className="w-24 text-right text-xl font-semibold">{prix(prixUnitaire(l) * l.quantite)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex w-[400px] shrink-0 flex-col bg-sable/70 px-8 py-8">
          <p className="text-base font-semibold text-marron-doux">Récapitulatif</p>
          <div className="mt-4 flex items-baseline justify-between border-b border-trait pb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="font-serif text-6xl">{prixEuro(panier.total)}</span>
          </div>
          <p className="mt-2 text-right text-sm text-marron-doux">TVA incluse</p>

          <div className="mt-auto">
            <ClubBorne configure={clubConfigure} />
          </div>

          <h2 className="mt-7 font-serif text-4xl">Tu la prends où&nbsp;?</h2>
          <div className="mt-5 flex flex-col gap-3">
            {(
              [
                ["sur-place", "Sur place"],
                ["a-emporter", "À emporter"],
              ] as const
            ).map(([m, libelle]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex h-[84px] items-center justify-between rounded-full bg-marron px-8 text-left text-papier active:bg-marron-fonce"
              >
                <span>
                  <span className="block text-xl font-semibold">{libelle}</span>
                  <span className="block text-sm text-papier/75">Payer {prixEuro(panier.total)}</span>
                </span>
                <span aria-hidden className="text-2xl">
                  →
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {mode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-marron-fonce/40 backdrop-blur-[2px]" onClick={() => setMode(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="envoi-titre" className="flex w-[620px] flex-col items-center gap-5 rounded-[32px] bg-papier p-12 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="rounded-full bg-sable px-4 py-1.5 text-sm font-semibold">Caisse et paiement : pas encore reliés</p>
            <h2 id="envoi-titre" className="font-serif text-5xl leading-tight">
              Cette commande n&apos;est pas envoyée
            </h2>
            <p className="text-xl leading-relaxed text-marron-doux">
              L&apos;envoi à la caisse Zelty et le paiement sur le terminal seront branchés à l&apos;étape suivante. En attendant, rien n&apos;est encaissé{panier.membre ? " et aucun point n'est crédité" : ""}.
            </p>
            <button type="button" onClick={() => setMode(null)} className="mt-2 flex h-16 items-center rounded-full border-2 border-trait px-8 text-lg font-semibold active:bg-sable">
              Revenir à ma commande
            </button>
          </div>
        </div>
      )}
    </>
  );
}
