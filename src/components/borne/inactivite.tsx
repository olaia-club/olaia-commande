"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { usePanier } from "./panier-context";

const INACTIF_APRES = 75; // secondes sans toucher l'écran
const COMPTE_A_REBOURS = 15;

/**
 * Sur une borne, le client suivant ne doit jamais tomber sur la commande du
 * précédent : après 75 s sans contact, on demande « Tu es toujours là ? »,
 * puis on vide le panier et on revient à l'accueil.
 */
export function Inactivite() {
  const chemin = usePathname();
  const router = useRouter();
  const { vider } = usePanier();
  const [restant, setRestant] = useState<number | null>(null);
  const dernierContact = useRef(0);

  const surAccueil = chemin === "/borne";

  useEffect(() => {
    if (surAccueil) return;
    dernierContact.current = Date.now();
    const toucher = () => {
      dernierContact.current = Date.now();
      setRestant(null);
    };
    window.addEventListener("pointerdown", toucher, { passive: true });
    const minuteur = window.setInterval(() => {
      const inactif = (Date.now() - dernierContact.current) / 1000;
      if (inactif < INACTIF_APRES) return;
      const reste = Math.ceil(INACTIF_APRES + COMPTE_A_REBOURS - inactif);
      if (reste > 0) {
        setRestant(reste);
        return;
      }
      setRestant(null);
      vider();
      router.replace("/borne");
    }, 500);
    return () => {
      window.removeEventListener("pointerdown", toucher);
      window.clearInterval(minuteur);
    };
  }, [surAccueil, router, vider]);

  if (surAccueil || restant == null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marron-fonce/45 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="inactif-titre">
      <div className="flex w-[440px] flex-col items-center gap-5 rounded-[28px] bg-papier p-10 text-center shadow-2xl">
        <h2 id="inactif-titre" className="font-serif text-4xl">
          Tu es toujours là&nbsp;?
        </h2>
        <p className="text-lg text-marron-doux">Sans réponse, on repart de zéro dans {restant}&nbsp;s.</p>
        <button type="button" className="h-16 w-full rounded-full bg-marron text-lg font-semibold text-papier">
          Je suis là
        </button>
      </div>
    </div>
  );
}
