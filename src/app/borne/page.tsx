import Image from "next/image";
import Link from "next/link";

/**
 * Accueil de la borne, en boucle quand personne ne commande. La vidéo d'Olaía
 * se branche avec NEXT_PUBLIC_BORNE_VIDEO (adresse d'un .mp4) ; sans elle, la
 * photo surf de la charte, qui avance lentement.
 */
export default function AccueilBorne() {
  const video = process.env.NEXT_PUBLIC_BORNE_VIDEO;

  return (
    <Link href="/borne/carte" className="relative block flex-1 overflow-hidden bg-marron-fonce text-papier" aria-label="Touche l'écran pour commander">
      {video ? (
        <video className="absolute inset-0 size-full object-cover" src={video} poster="/borne/accueil-surf.jpg" autoPlay muted loop playsInline />
      ) : (
        <Image src="/borne/accueil-surf.jpg" alt="" fill priority sizes="100vw" className="borne-derive object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-marron-fonce/85 via-marron-fonce/35 to-marron-fonce/30" />

      <div className="relative flex h-full flex-col justify-between p-14">
        <Image src="/brand/olaia-logo-complet-blanc.svg" alt="Olaía, good coffee, good vibes" width={210} height={114} priority className="h-[114px] w-auto self-start" />

        <div>
          <h1 className="font-serif text-[104px] leading-none">Bienvenue au spot.</h1>
          <p className="mt-4 font-serif text-4xl text-papier/90 italic">Touche l&apos;écran pour commander.</p>
          <span className="mt-12 inline-flex h-24 items-center gap-4 rounded-full bg-papier px-14 text-2xl font-semibold text-marron">
            Commander
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
