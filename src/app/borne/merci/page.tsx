"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { prixEuro } from "@/components/borne/format";
import { usePanier } from "@/components/borne/panier-context";

const RETOUR_APRES = 20; // secondes avant de revenir à l'accueil

/**
 * Écran de fin : merci, numéro de commande, Club, puis retour à l'accueil.
 * Le panier est déjà vidé : l'écran ne garde que le résumé de la commande.
 */
export default function Merci() {
  const router = useRouter();
  const { fin, vider } = usePanier();
  const [reste, setReste] = useState(RETOUR_APRES);

  useEffect(() => {
    if (!fin) {
      router.replace("/borne");
      return;
    }
    const debut = Date.now();
    const minuteur = window.setInterval(() => {
      const r = RETOUR_APRES - Math.floor((Date.now() - debut) / 1000);
      if (r > 0) return setReste(r);
      window.clearInterval(minuteur);
      vider();
      router.replace("/borne");
    }, 250);
    return () => window.clearInterval(minuteur);
  }, [fin, router, vider]);

  if (!fin) return null;

  const nouvelle = () => {
    vider();
    router.replace("/borne");
  };
  const prenom = fin.membre?.prenom;

  return (
    <div className="flex flex-1 flex-col bg-creme">
      {fin.apercu && (
        <p className="bg-marron px-6 py-2.5 text-center text-base font-semibold text-papier">
          Aperçu de l&apos;écran de fin : cette commande n&apos;est pas envoyée à Zelty et rien n&apos;est encaissé.
        </p>
      )}
      <div className="flex min-h-0 flex-1">
        <section className="flex flex-1 flex-col justify-center px-16">
          <Image src="/brand/olaia-logo-marron.svg" alt="Olaía" width={151} height={60} className="h-[60px] w-auto self-start" />
          <h1 className="mt-10 font-serif text-[88px] leading-[0.95]">{prenom ? `Merci ${prenom} !` : "Merci !"}</h1>
          <p className="mt-5 max-w-[560px] text-2xl leading-snug text-marron-doux">
            {fin.mode === "sur-place" ? "Installe-toi, on t'appelle au comptoir dès que c'est prêt." : "On t'appelle au comptoir dès que c'est prêt, à emporter."}
          </p>
          <p className="mt-3 text-lg text-marron-doux">
            {fin.nbArticles} article{fin.nbArticles > 1 ? "s" : ""} · {prixEuro(fin.total)} · {fin.mode === "sur-place" ? "Sur place" : "À emporter"}
          </p>

          <div className="mt-12 flex items-center gap-6">
            <button
              type="button"
              onClick={nouvelle}
              className="flex h-[84px] items-center rounded-full bg-marron px-12 text-xl font-semibold text-papier active:bg-marron-fonce"
            >
              Nouvelle commande
            </button>
            <p className="text-base text-marron-doux" aria-live="off">
              Retour à l&apos;accueil dans {reste}&nbsp;s
            </p>
          </div>
        </section>

        <aside className="flex w-[440px] shrink-0 flex-col justify-center gap-6 bg-sable/70 px-12">
          <div className="rounded-[28px] bg-papier px-8 py-7 text-center">
            <p className="text-base font-semibold text-marron-doux">Ton numéro de commande</p>
            {fin.numero ? (
              <p className="mt-1 font-serif text-[112px] leading-none">{fin.numero}</p>
            ) : (
              <p className="mt-3 text-lg leading-snug">Il s&apos;affichera ici dès que les commandes partiront dans Zelty.</p>
            )}
          </div>

          <div className="rounded-[28px] border-2 border-trait px-8 py-6">
            <p className="text-lg font-semibold">Club Olaía</p>
            {fin.membre ? (
              <p className="mt-1 text-base leading-snug text-marron-doux">
                {fin.apercu
                  ? "Les points de la commande arriveront sur ta carte une fois le paiement branché."
                  : "Tes points arrivent sur ta carte, et dans ton Wallet si tu l'y as ajoutée."}
              </p>
            ) : (
              <p className="mt-1 text-base leading-snug text-marron-doux">
                La prochaine fois, tape ton numéro dans le panier : 1&nbsp;€ dépensé = 1 point.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
