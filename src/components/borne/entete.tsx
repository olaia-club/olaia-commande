"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { usePanier } from "./panier-context";

/** Bandeau du haut de la borne : logo et « Recommencer ». */
export function Entete() {
  const router = useRouter();
  const { vider, nbArticles } = usePanier();

  return (
    <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-trait px-10">
      <Image src="/brand/olaia-logo-marron.svg" alt="Olaía" width={100} height={50} className="h-10 w-auto" priority />
      <button
        type="button"
        onClick={() => {
          vider();
          router.replace("/borne");
        }}
        className="flex h-14 items-center gap-3 rounded-full border-2 border-trait px-6 text-base font-semibold active:bg-sable"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
        {nbArticles ? "Annuler et recommencer" : "Recommencer"}
      </button>
    </header>
  );
}
