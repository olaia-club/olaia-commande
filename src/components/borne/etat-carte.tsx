import Link from "next/link";

import type { EtatCarte } from "@/lib/zelty/carte";

const TEXTES: Record<Exclude<EtatCarte["etat"], "ok">, { titre: string; corps: string }> = {
  "non-configure": {
    titre: "La carte n'est pas encore reliée à Zelty",
    corps: "Elle s'affichera ici dès que la clé API Zelty d'Olaía sera ajoutée. Aucun produit n'est inventé en attendant.",
  },
  vide: {
    titre: "Zelty ne renvoie aucun produit en vente",
    corps: "Vérifie dans Zelty que les produits sont actifs et ont un prix, et que l'identifiant du restaurant est le bon.",
  },
  erreur: {
    titre: "Zelty ne répond pas pour le moment",
    corps: "Commande au comptoir, l'équipe s'occupe de toi. La carte revient dès que Zelty répond.",
  },
};

/** Ce que voit la borne quand la carte Zelty n'est pas disponible : l'état réel, sans données inventées. */
export function EtatCarteIndisponible({ etat }: { etat: Exclude<EtatCarte, { etat: "ok" }> }) {
  const t = TEXTES[etat.etat];
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="flex max-w-[620px] flex-col items-center gap-5 rounded-[32px] bg-papier p-12 text-center">
        <p className="rounded-full bg-sable px-4 py-1.5 text-sm font-semibold">
          {etat.etat === "non-configure" ? "Zelty : non configuré" : etat.etat === "vide" ? "Zelty : carte vide" : "Zelty : indisponible"}
        </p>
        <h1 className="font-serif text-5xl leading-tight">{t.titre}</h1>
        <p className="text-xl leading-relaxed text-marron-doux">{t.corps}</p>
        {etat.etat === "erreur" && <p className="text-sm text-marron-doux">Détail technique : {etat.message}</p>}
        <Link href="/borne" className="mt-2 flex h-16 items-center rounded-full border-2 border-trait px-8 text-lg font-semibold active:bg-sable">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
