import { connection } from "next/server";
import { Suspense } from "react";

import { CarteBorne } from "@/components/borne/carte-borne";
import { Entete } from "@/components/borne/entete";
import { EtatCarteIndisponible } from "@/components/borne/etat-carte";
import { lireCarte } from "@/lib/zelty/carte";

/** Lue à chaque visite (le catalogue Zelty, lui, est gardé une minute). */
async function Carte() {
  await connection();
  const carte = await lireCarte();
  if (carte.etat !== "ok") return <EtatCarteIndisponible etat={carte} />;
  return <CarteBorne catalogue={carte.catalogue} />;
}

export default function PageCarte() {
  return (
    <>
      <Entete />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <p className="font-serif text-3xl text-marron-doux italic">La carte arrive…</p>
          </div>
        }
      >
        <Carte />
      </Suspense>
    </>
  );
}
