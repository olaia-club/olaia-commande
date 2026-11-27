"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

/**
 * Lecture du QR de la carte Wallet (ou web) avec la caméra avant de l'iPad,
 * celle qui regarde le client. L'image ne quitte pas l'iPad : seul le texte du
 * QR part vers le serveur. La caméra s'éteint dès qu'on quitte cet écran.
 */
export function ScanCarte({
  lu,
  message,
  enCours,
  sansCamera,
}: {
  lu: (valeur: string) => void;
  message?: string;
  enCours: boolean;
  sansCamera: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<"demarrage" | "ok" | "refusee" | "absente">("demarrage");
  // Après une lecture, pause le temps de la réponse (et 2 s après un QR refusé).
  const enPause = useRef(false);
  const dernierLu = useRef<{ valeur: string; a: number } | null>(null);
  const appeler = useRef(lu);

  useEffect(() => {
    appeler.current = lu;
  }, [lu]);

  useEffect(() => {
    if (enCours) {
      enPause.current = true;
      return;
    }
    const t = setTimeout(() => {
      enPause.current = false;
    }, 1500);
    return () => clearTimeout(t);
  }, [enCours, message]);

  useEffect(() => {
    let flux: MediaStream | null = null;
    let image = 0;
    let fini = false;
    const toile = document.createElement("canvas");
    const ctx = toile.getContext("2d", { willReadFrequently: true });
    let derniere = 0;

    const analyser = (t: number) => {
      if (fini) return;
      image = requestAnimationFrame(analyser);
      const v = video.current;
      if (!v || !ctx || v.readyState < 2 || enPause.current || t - derniere < 150) return;
      derniere = t;
      const l = 480;
      const h = Math.round((v.videoHeight / v.videoWidth) * l) || 360;
      toile.width = l;
      toile.height = h;
      ctx.drawImage(v, 0, 0, l, h);
      const code = jsQR(ctx.getImageData(0, 0, l, h).data, l, h, { inversionAttempts: "dontInvert" });
      if (!code?.data) return;
      // Le même QR tenu devant la caméra n'est renvoyé qu'une fois toutes les 3 s.
      const avant = dernierLu.current;
      if (avant && avant.valeur === code.data && t - avant.a < 3000) return;
      dernierLu.current = { valeur: code.data, a: t };
      enPause.current = true;
      appeler.current(code.data);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamera("absente");
        return;
      }
      try {
        flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
        if (fini) return flux.getTracks().forEach((p) => p.stop());
        if (video.current) {
          video.current.srcObject = flux;
          await video.current.play().catch(() => {});
        }
        setCamera("ok");
        image = requestAnimationFrame(analyser);
      } catch (e) {
        setCamera(e instanceof DOMException && e.name === "NotAllowedError" ? "refusee" : "absente");
      }
    })();

    return () => {
      fini = true;
      cancelAnimationFrame(image);
      flux?.getTracks().forEach((p) => p.stop());
    };
  }, []);

  if (camera === "refusee" || camera === "absente") {
    return (
      <div className="mt-6 flex w-full flex-col items-center gap-4 rounded-3xl bg-creme px-8 py-10">
        <p className="font-serif text-3xl">{camera === "refusee" ? "La caméra n'est pas autorisée" : "Pas de caméra disponible"}</p>
        <p className="text-lg text-marron-doux">
          {camera === "refusee" ? "Autorise la caméra pour ce site dans les réglages de l'iPad." : "Cet appareil ne donne pas accès à sa caméra."} En attendant, tape ton
          numéro.
        </p>
        <button type="button" onClick={sansCamera} className="mt-2 flex h-16 items-center rounded-full bg-marron px-8 text-lg font-semibold text-papier active:bg-marron-fonce">
          Taper mon numéro
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-marron-fonce">
        {/* Miroir : le client se voit comme dans une glace. */}
        <video ref={video} muted playsInline autoPlay className="size-full -scale-x-100 object-cover" />
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="aspect-square h-[62%] rounded-3xl border-4 border-papier/90 shadow-[0_0_0_999px_rgb(63_23_7/0.35)]" />
        </div>
        {(camera === "demarrage" || enCours) && (
          <p className="absolute inset-x-0 bottom-4 text-center text-lg font-semibold text-papier">{enCours ? "Recherche de ta carte…" : "Ouverture de la caméra…"}</p>
        )}
      </div>
      <p role="alert" className="mt-3 h-6 text-base font-semibold text-marron">
        {message}
      </p>
      <p className="mt-1 text-lg text-marron-doux">Ouvre ta carte Olaía dans ton Wallet et montre son QR code à la caméra, en haut de l&apos;iPad.</p>
    </>
  );
}
