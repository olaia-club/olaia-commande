"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Catalogue, Plat } from "@/lib/zelty/lecture";

import { FicheProduit } from "./fiche-produit";
import { articles, prix, prixEuro } from "./format";
import { prixUnitaire, usePanier } from "./panier-context";
import { PhotoPlat } from "./photo-plat";

/** La carte de la borne : catégories, plats et commande en cours. */
export function CarteBorne({ catalogue }: { catalogue: Catalogue }) {
  const { categories, plats, options } = catalogue;
  const panier = usePanier();
  const [ouvert, setOuvert] = useState<{ plat: Plat; categorie: string } | null>(null);
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);
  const zone = useRef<HTMLDivElement>(null);
  const sections = useRef(new Map<string, HTMLElement>());

  // La catégorie surlignée suit le défilement (la dernière quand on est tout en bas).
  useEffect(() => {
    const racine = zone.current;
    if (!racine) return;
    const suivre = () => {
      if (racine.scrollTop + racine.clientHeight >= racine.scrollHeight - 8) {
        setActive(categories.at(-1)?.id ?? null);
        return;
      }
      const haut = racine.getBoundingClientRect().top + 120;
      let courante = categories[0]?.id ?? null;
      for (const c of categories) {
        const el = sections.current.get(c.id);
        if (el && el.getBoundingClientRect().top <= haut) courante = c.id;
      }
      setActive(courante);
    };
    racine.addEventListener("scroll", suivre, { passive: true });
    return () => racine.removeEventListener("scroll", suivre);
  }, [categories]);

  const groupesDe = (p: Plat) => p.options.map((id) => options[id]).filter(Boolean);

  const ajouterDirect = (p: Plat, categorie: string) => {
    if (groupesDe(p).some((g) => g.min > 0)) {
      setOuvert({ plat: p, categorie });
      return;
    }
    panier.ajouter({ platId: p.id, nom: p.nom, photo: p.photo, prixBase: p.prix, choix: [] }, 1);
  };

  return (
    <div className="flex min-h-0 flex-1">
      {/* Catégories */}
      <nav className="flex w-[220px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-trait px-4 py-6" aria-label="Catégories">
        <p className="px-4 pb-3 text-sm font-semibold tracking-wide text-marron-doux">La carte</p>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setActive(c.id);
              sections.current.get(c.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`rounded-2xl px-4 py-4 text-left font-serif text-2xl leading-tight transition-colors ${
              active === c.id ? "bg-marron text-papier" : "active:bg-sable"
            }`}
          >
            {c.nom}
          </button>
        ))}
      </nav>

      {/* Plats */}
      <div ref={zone} className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-10">
        {categories.map((c) => (
          <section
            key={c.id}
            data-categorie={c.id}
            ref={(el) => {
              if (el) sections.current.set(c.id, el);
              else sections.current.delete(c.id);
            }}
            className="pt-8 first:pt-7"
          >
            <h2 className="font-serif text-5xl">{c.nom}</h2>
            <ul className="mt-5 grid grid-cols-3 gap-x-5 gap-y-6">
              {plats
                .filter((p) => p.categories.includes(c.id))
                .map((p) => (
                  <li key={p.id} className="relative">
                    <button type="button" onClick={() => setOuvert({ plat: p, categorie: c.nom })} className="block w-full text-left">
                      <PhotoPlat src={p.photo} alt={p.nom} className="aspect-[4/3] w-full rounded-[20px]" />
                      <span className="mt-2 block font-serif text-2xl leading-tight">{p.nom}</span>
                      <span className="mt-0.5 block text-lg font-semibold">{prix(p.prix)}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Ajouter ${p.nom}`}
                      onClick={() => ajouterDirect(p, c.nom)}
                      className="absolute top-[calc(75%*0.75)] right-3 flex size-14 -translate-y-1/2 items-center justify-center rounded-full bg-marron text-3xl text-papier shadow-lg ring-4 ring-papier/70 active:scale-95"
                    >
                      +
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Commande en cours */}
      <aside className="flex w-[300px] shrink-0 flex-col border-l border-trait bg-papier/60 px-6 py-6">
        <h2 className="font-serif text-4xl">Ta commande</h2>
        <p className="mt-1 text-sm font-semibold tracking-wide text-marron-doux">{panier.nbArticles ? articles(panier.nbArticles) : "Vide pour l'instant"}</p>
        <ul className="mt-4 min-h-0 flex-1 divide-y divide-trait overflow-y-auto overscroll-contain">
          {panier.lignes.map((l) => (
            <li key={l.cle} className="flex items-center gap-3 py-3">
              <PhotoPlat src={l.photo} alt="" className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl leading-tight">
                  {l.quantite > 1 && <span className="font-sans text-base font-semibold">{l.quantite}× </span>}
                  {l.nom}
                </p>
                {l.choix.length > 0 && <p className="truncate text-sm text-marron-doux">{l.choix.map((c) => c.nom).join(" · ")}</p>}
              </div>
              <span className="text-base font-semibold">{prix(prixUnitaire(l) * l.quantite)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-trait pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold">Total</span>
            <span className="font-serif text-5xl">{prixEuro(panier.total)}</span>
          </div>
          {panier.nbArticles ? (
            <Link href="/borne/panier" className="mt-4 flex h-[72px] items-center justify-center rounded-full bg-marron text-xl font-semibold text-papier active:bg-marron-fonce">
              Valider ma commande
            </Link>
          ) : (
            <p className="mt-4 flex h-[72px] items-center justify-center rounded-full bg-marron/15 text-lg font-semibold text-marron-doux">Choisis un produit</p>
          )}
        </div>
      </aside>

      {ouvert && (
        <FicheProduit
          plat={ouvert.plat}
          categorie={ouvert.categorie}
          groupes={groupesDe(ouvert.plat)}
          onFermer={() => setOuvert(null)}
          onAjouter={(choix, quantite) => {
            panier.ajouter({ platId: ouvert.plat.id, nom: ouvert.plat.nom, photo: ouvert.plat.photo, prixBase: ouvert.plat.prix, choix }, quantite);
            setOuvert(null);
          }}
        />
      )}
    </div>
  );
}
