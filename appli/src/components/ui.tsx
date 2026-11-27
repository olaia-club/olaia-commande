import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { couleurs, espace, polices, rayon } from "@/lib/theme";

import { LOGO_BLANC, LOGO_MARRON } from "./logos";

/** Titre de la charte : Newsreader, jamais pour les boutons ou les prix. */
export function Titre({ style, taille = 30, ...props }: TextProps & { taille?: number }) {
  return <Text accessibilityRole="header" {...props} style={[{ fontFamily: polices.titre, fontSize: taille, lineHeight: taille * 1.15, color: couleurs.marron }, style]} />;
}

type Variante = "normal" | "doux" | "petit" | "gras" | "inverse";

export function Texte({ style, variante = "normal", ...props }: TextProps & { variante?: Variante }) {
  return <Text {...props} style={[styles.texte, styles[variante], style]} />;
}

export function Bouton({
  titre,
  onPress,
  secondaire = false,
  occupe = false,
  desactive = false,
  style,
}: {
  titre: string;
  onPress: () => void;
  secondaire?: boolean;
  occupe?: boolean;
  desactive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactif = desactive || occupe;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif, busy: occupe }}
      disabled={inactif}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bouton,
        secondaire ? styles.boutonSecondaire : styles.boutonPrincipal,
        inactif && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {occupe ? (
        <ActivityIndicator color={secondaire ? couleurs.marron : couleurs.blanc} />
      ) : (
        <Text style={[styles.boutonTexte, { color: secondaire ? couleurs.marron : couleurs.blanc }]}>{titre}</Text>
      )}
    </Pressable>
  );
}

/** Carte papier sur fond crème. */
export function Panneau({ children, style, sable = false }: { children: ReactNode; style?: StyleProp<ViewStyle>; sable?: boolean }) {
  return <View style={[styles.panneau, sable && { backgroundColor: couleurs.sable, borderColor: "transparent" }, style]}>{children}</View>;
}

/** Message d'état : ce qui manque ou ce qui ne répond pas, dit franchement. */
export function Etat({ titre, texte, action }: { titre: string; texte?: string; action?: { titre: string; onPress: () => void } }) {
  return (
    <Panneau sable style={{ gap: espace.s }}>
      <Texte variante="gras">{titre}</Texte>
      {texte ? <Texte variante="doux">{texte}</Texte> : null}
      {action ? <Bouton secondaire titre={action.titre} onPress={action.onPress} style={{ marginTop: espace.s }} /> : null}
    </Panneau>
  );
}

export function Logo({ largeur = 120, blanc = false }: { largeur?: number; blanc?: boolean }) {
  // viewBox du logo : 649.8 × 258
  return <SvgXml xml={blanc ? LOGO_BLANC : LOGO_MARRON} width={largeur} height={(largeur * 258) / 649.8} accessibilityLabel="Olaía" />;
}

export function Chargement() {
  return (
    <View style={{ paddingVertical: espace.xl, alignItems: "center" }}>
      <ActivityIndicator color={couleurs.marron} />
    </View>
  );
}

const styles = StyleSheet.create({
  texte: { fontFamily: polices.texte, fontSize: 16, lineHeight: 22, color: couleurs.marron },
  normal: {},
  doux: { color: couleurs.marronDoux },
  petit: { fontSize: 13, lineHeight: 18, color: couleurs.marronDoux },
  gras: { fontFamily: polices.gras },
  inverse: { color: couleurs.blanc },
  bouton: { minHeight: 52, borderRadius: rayon.plein, paddingHorizontal: espace.l, alignItems: "center", justifyContent: "center" },
  boutonPrincipal: { backgroundColor: couleurs.marron },
  boutonSecondaire: { borderWidth: 1.5, borderColor: couleurs.marron, backgroundColor: "transparent" },
  boutonTexte: { fontFamily: polices.gras, fontSize: 16 },
  panneau: { backgroundColor: couleurs.papier, borderRadius: rayon.m, borderWidth: 1, borderColor: couleurs.trait, padding: espace.m },
});
