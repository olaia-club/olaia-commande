import Image from "next/image";

const parts = [
  {
    title: "La borne",
    body: "L'iPad du comptoir : vidéo d'accueil, carte lue dans Zelty, panier, paiement au terminal, Club Olaía et mode express.",
  },
  {
    title: "Le back-office",
    body: "Offres du moment, ruptures lues dans Zelty, réglages des iPad, Club Olaía avec FIMIO, allergènes et ordre des produits.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <Image src="/brand/olaia-logo-marron.svg" alt="Olaía" width={120} height={60} priority className="h-12 w-auto self-start" />

      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-5xl leading-none">Logiciel de commande</h1>
        <p className="text-lg text-marron-doux">
          La base du projet est en place. Les écrans arrivent étape par étape, d&apos;après la maquette validée.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {parts.map((p) => (
          <li key={p.title} className="flex flex-col gap-2 rounded-2xl border border-trait bg-papier p-6">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="leading-relaxed text-marron-doux">{p.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
