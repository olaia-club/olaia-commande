import QRCode from "qrcode";
import { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";

import { couleurs } from "@/lib/theme";

/**
 * QR dessiné en SVG natif (pas d'image, pas de réseau) : le numéro de la carte,
 * que l'appli iPad lit à la caméra comme une carte Wallet.
 */
export function Qr({ valeur, taille = 180 }: { valeur: string; taille?: number }) {
  const { chemin, cote } = useMemo(() => {
    const { modules } = QRCode.create(valeur, { errorCorrectionLevel: "M" });
    const n = modules.size;
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (modules.get(y, x)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
    return { chemin: d, cote: n + 4 };
  }, [valeur]);
  return (
    <Svg width={taille} height={taille} viewBox={`0 0 ${cote} ${cote}`} accessibilityLabel={`QR de la carte ${valeur}`}>
      <Rect width={cote} height={cote} fill={couleurs.blanc} />
      <Path d={chemin} fill={couleurs.marron} />
    </Svg>
  );
}
