/**
 * Infos pratiques du café. À COMPLÉTER par Olaía : tant qu'une valeur est
 * vide, l'écran Infos la montre « à venir » au lieu d'inventer une adresse ou
 * des horaires.
 */
export const INFOS = {
  adresse: "" as string,
  ville: "Lyon",
  /** Lien Plans / Google Maps, facultatif. */
  itineraire: "" as string,
  /** Une ligne par jour ou par groupe de jours, par exemple « Lun – Ven · 8 h – 18 h ». */
  horaires: [] as string[],
  telephone: "" as string,
  instagram: "" as string,
  site: "" as string,
};
