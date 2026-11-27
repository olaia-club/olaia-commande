/**
 * Charte Olaía v5, la même que l'appli iPad (src/app/globals.css à la racine) :
 * fond crème, cartes papier, panneaux sable, texte marron. Le blanc pur ne sert
 * qu'en inverse (sur marron ou sur photo).
 */
export const couleurs = {
  creme: "#F4EEE7",
  papier: "#FBF8F4",
  sable: "#E5D9CB",
  marron: "#541F09",
  marronFonce: "#3F1707",
  marronDoux: "#7A5444",
  trait: "rgba(84, 31, 9, 0.16)",
  blanc: "#FFFFFF",
  alerte: "#9A3412",
} as const;

/** Newsreader seulement pour les titres, DM Sans pour tout le reste. */
export const polices = {
  titre: "Newsreader_400Regular",
  texte: "DMSans_400Regular",
  moyen: "DMSans_500Medium",
  gras: "DMSans_700Bold",
} as const;

export const espace = { xs: 4, s: 8, m: 16, l: 24, xl: 32 } as const;
export const rayon = { s: 10, m: 16, l: 24, plein: 999 } as const;
