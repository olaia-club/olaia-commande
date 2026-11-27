import type { ColorValue } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

/** Icônes des onglets, au trait, dans la couleur de l'onglet. */
type P = { couleur: ColorValue; taille?: number };

export function IconeAccueil({ couleur, taille = 24 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function IconeTasse({ couleur, taille = 24 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <Path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <Path d="M8 3.5c-.6.9.6 1.6 0 2.5M12 3.5c-.6.9.6 1.6 0 2.5" />
    </Svg>
  );
}

export function IconeCarte({ couleur, taille = 24 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={2.5} y={5} width={19} height={14} rx={2.5} />
      <Path d="M2.5 10h19M6 15h4" />
    </Svg>
  );
}

export function IconeInfo({ couleur, taille = 24 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11v5.5M12 7.6v.1" />
    </Svg>
  );
}
