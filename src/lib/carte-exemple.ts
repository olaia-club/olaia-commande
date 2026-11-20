import type { Catalogue, GroupeOptions, Plat } from "@/lib/zelty/lecture";

/**
 * Carte d'EXEMPLE, demandée le 20 nov. 2026 pour tester la borne avant d'avoir
 * la clé API Zelty d'Olaía. Produits et prix imaginés : la borne l'affiche
 * avec la mention « Carte d'exemple ». Dès que ZELTY_API_KEY est renseignée,
 * la vraie carte Zelty la remplace et ce fichier ne sert plus.
 */

const groupes: GroupeOptions[] = [
  {
    id: "taille",
    nom: "Taille",
    min: 1,
    max: 1,
    choix: [
      { id: "s", nom: "S", supplement: 0 },
      { id: "m", nom: "M", supplement: 0.5 },
      { id: "l", nom: "L", supplement: 1 },
    ],
  },
  {
    id: "lait",
    nom: "Lait",
    min: 1,
    max: 1,
    choix: [
      { id: "entier", nom: "Entier", supplement: 0 },
      { id: "avoine", nom: "Avoine", supplement: 0.5 },
      { id: "amande", nom: "Amande", supplement: 0.5 },
      { id: "sans-lactose", nom: "Sans lactose", supplement: 0 },
    ],
  },
  {
    id: "extras",
    nom: "Extras",
    min: 0,
    max: 2,
    choix: [
      { id: "shot", nom: "Shot en plus", supplement: 0.6 },
      { id: "vanille", nom: "Sirop vanille", supplement: 0.4 },
      { id: "caramel", nom: "Sirop caramel", supplement: 0.4 },
    ],
  },
  {
    id: "pain",
    nom: "Pain",
    min: 1,
    max: 1,
    choix: [
      { id: "nature", nom: "Nature", supplement: 0 },
      { id: "sesame", nom: "Sésame", supplement: 0 },
      { id: "complet", nom: "Complet", supplement: 0 },
    ],
  },
];

const photo = (nom: string) => `/borne/exemple/${nom}.jpg`;
const LAIT = ["taille", "lait", "extras"];

const plats: Plat[] = [
  // Cafés
  { id: "espresso", nom: "Espresso", description: "Le grain du moment, serré.", prix: 2.2, photo: null, categories: ["cafes"], options: ["extras"] },
  { id: "allonge", nom: "Allongé", description: null, prix: 2.5, photo: null, categories: ["cafes"], options: ["extras"] },
  { id: "cortado", nom: "Cortado", description: "Un espresso, un nuage de lait.", prix: 3.2, photo: null, categories: ["cafes"], options: ["lait"] },
  { id: "flat-white", nom: "Flat white", description: "Double ristretto et lait velouté.", prix: 4.2, photo: null, categories: ["cafes"], options: LAIT },
  { id: "latte", nom: "Latte", description: "Doux et lacté.", prix: 4.5, photo: photo("latte"), categories: ["cafes"], options: LAIT },
  { id: "cappuccino", nom: "Cappuccino", description: "Mousse généreuse.", prix: 4.2, photo: null, categories: ["cafes"], options: LAIT },
  { id: "chai-latte", nom: "Chai latte", description: "Épices douces et lait chaud.", prix: 4.8, photo: null, categories: ["cafes"], options: LAIT },
  { id: "matcha-latte", nom: "Matcha latte", description: null, prix: 5, photo: null, categories: ["cafes"], options: LAIT },
  // Glacés
  { id: "iced-latte", nom: "Iced latte", description: "Espresso, lait froid, glaçons.", prix: 5, photo: photo("iced-latte"), categories: ["glaces"], options: LAIT },
  { id: "iced-matcha", nom: "Iced matcha", description: null, prix: 5.5, photo: null, categories: ["glaces"], options: ["taille", "lait"] },
  { id: "cold-brew", nom: "Cold brew", description: "Infusé à froid pendant 18 heures.", prix: 4.5, photo: null, categories: ["glaces"], options: ["taille"] },
  { id: "espresso-tonic", nom: "Espresso tonic", description: "Espresso sur tonic et glaçons.", prix: 5, photo: null, categories: ["glaces"], options: [] },
  // Jus et smoothies
  { id: "orange", nom: "Jus d'orange pressé", description: null, prix: 4.5, photo: null, categories: ["jus"], options: [] },
  { id: "smoothie-coco", nom: "Smoothie coco mangue", description: "Coco, mangue, banane.", prix: 6.5, photo: photo("smoothie-coco"), categories: ["jus"], options: [] },
  { id: "limonade", nom: "Limonade maison", description: "Citron, menthe.", prix: 4, photo: null, categories: ["jus"], options: [] },
  // À manger
  { id: "bowl-acai", nom: "Bowl açaí", description: "Açaí, granola, fruits rouges.", prix: 9.5, photo: photo("bowl-acai"), categories: ["manger"], options: [] },
  { id: "bowl-figues", nom: "Bowl yaourt figues", description: "Yaourt, figues, miel, granola.", prix: 8.5, photo: photo("bowl-figues"), categories: ["manger"], options: [] },
  { id: "bowl-prunes", nom: "Bowl prunes rôties", description: "Yaourt, prunes rôties, amandes.", prix: 8.5, photo: photo("bowl-prunes"), categories: ["manger"], options: [] },
  { id: "bagel-saumon", nom: "Bagel saumon", description: "Saumon fumé, cream cheese, aneth.", prix: 9.5, photo: null, categories: ["manger"], options: ["pain"] },
  { id: "bagel-legumes", nom: "Bagel légumes grillés", description: "Légumes grillés, houmous.", prix: 8.5, photo: null, categories: ["manger"], options: ["pain"] },
  { id: "avocado-toast", nom: "Avocado toast", description: "Pain de campagne, avocat, citron.", prix: 9, photo: null, categories: ["manger"], options: [] },
  // Douceurs
  { id: "banana-bread", nom: "Banana bread", description: "La tranche, fait maison.", prix: 3.5, photo: null, categories: ["douceurs"], options: [] },
  { id: "cookie", nom: "Cookie", description: "Fait maison.", prix: 2.8, photo: null, categories: ["douceurs"], options: [] },
  { id: "cinnamon-roll", nom: "Cinnamon roll", description: null, prix: 3.8, photo: null, categories: ["douceurs"], options: [] },
];

export const CARTE_EXEMPLE: Catalogue = {
  categories: [
    { id: "cafes", nom: "Cafés" },
    { id: "glaces", nom: "Glacés" },
    { id: "jus", nom: "Jus et smoothies" },
    { id: "manger", nom: "À manger" },
    { id: "douceurs", nom: "Douceurs" },
  ],
  plats,
  options: Object.fromEntries(groupes.map((g) => [g.id, g])),
};
