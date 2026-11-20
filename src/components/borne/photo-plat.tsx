/* eslint-disable @next/next/no-img-element -- photos hébergées par Zelty, domaine pas encore connu */
import Image from "next/image";

/** Photo du plat venue de Zelty, ou le « O » d'Olaía quand Zelty n'en a pas. */
export function PhotoPlat({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (src) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} loading="lazy" decoding="async" draggable={false} />;
  }
  return (
    <div className={`flex items-center justify-center bg-sable ${className}`} aria-hidden>
      <Image src="/brand/olaia-o-marron.svg" alt="" width={48} height={54} className="h-[38%] w-auto opacity-25" />
    </div>
  );
}
