/**
 * Lecture du catalogue Zelty : transforme les réponses brutes de l'API en
 * données stables pour la borne. Fonctions pures, sans appel réseau.
 *
 * Les formes lues ici sont celles vues en production sur la caisse Zelty de
 * GREEKIA (API 2.5 : /catalog/dishes, /catalog/tags, /catalog/options). La
 * lecture reste tolérante, car la forme exacte varie selon la version de
 * l'API : à revérifier avec la clé d'Olaía.
 */

export type Choix = { id: string; nom: string; supplement: number };

export type GroupeOptions = {
  id: string;
  nom: string;
  /** Nombre de choix minimum (0 = facultatif). */
  min: number;
  /** Nombre de choix maximum. */
  max: number;
  choix: Choix[];
};

export type Plat = {
  id: string;
  nom: string;
  description: string | null;
  /** Prix TTC en euros. */
  prix: number;
  photo: string | null;
  /** Identifiants des catégories (tags Zelty). */
  categories: string[];
  /** Identifiants des groupes d'options. */
  options: string[];
};

export type Categorie = { id: string; nom: string };

export type Catalogue = {
  categories: Categorie[];
  plats: Plat[];
  options: Record<string, GroupeOptions>;
};

type Brut = Record<string, unknown>;

const estObjet = (v: unknown): v is Brut => typeof v === "object" && v !== null && !Array.isArray(v);

export const texte = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Liste d'une réponse Zelty : un tableau, ou { cle: [...] }, ou { data: [...] }. */
export function liste(d: unknown, cle: string): unknown[] {
  if (Array.isArray(d)) return d;
  if (estObjet(d)) {
    if (Array.isArray(d[cle])) return d[cle] as unknown[];
    if (Array.isArray(d.data)) return d.data as unknown[];
  }
  return [];
}

/** Prix Zelty (en centimes) en euros ; null si absent. */
export function prixEuros(p: unknown): number | null {
  const brut = estObjet(p) ? (p.amount_inc_tax ?? p.price_inc_tax ?? p.price ?? p.amount) : p;
  if (brut == null || brut === "") return null;
  const n = Number(brut);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) / 100 : null;
}

const id = (v: unknown): string | null => {
  const x = estObjet(v) ? (v.id ?? v.id_option ?? v.id_tag) : v;
  return x == null || x === "" ? null : String(x);
};

/** Un plat Zelty vendable, ou null (désactivé, sans nom ou sans prix). */
export function lirePlat(d: unknown): Plat | null {
  if (!estObjet(d)) return null;
  const ident = d.id ?? d.id_dish;
  const nom = texte(d.name) ?? texte(d.nom);
  if (ident == null || !nom) return null;
  if (d.disable || d.disabled || d.hidden || d.deleted || d.archived) return null;
  const prix = prixEuros(d.price ?? d.price_togo ?? d.price_takeaway);
  if (prix == null) return null; // sans prix, on ne peut pas le vendre
  const tags = (Array.isArray(d.tags) ? d.tags : Array.isArray(d.id_tags) ? d.id_tags : []).map(id).filter((x): x is string => !!x);
  const options = (Array.isArray(d.options) ? d.options : Array.isArray(d.id_options) ? d.id_options : [])
    .map(id)
    .filter((x): x is string => !!x);
  const photo =
    [d.image, d.photo, d.picture, d.image_url, d.thumb].map(texte).find((u) => !!u && /^https:\/\//.test(u)) ?? null;
  return { id: String(ident), nom, description: texte(d.description), prix, photo, categories: tags, options };
}

/** Un groupe d'options Zelty (« Taille », « Lait »…) avec ses choix et suppléments. */
export function lireOption(o: unknown): GroupeOptions | null {
  if (!estObjet(o) || o.id == null) return null;
  const valeurs = ([o.values, o.option_values, o.choices, o.items].find(Array.isArray) as unknown[] | undefined) ?? [];
  const choix = valeurs
    .map((v): Choix | null => {
      if (!estObjet(v) || v.id == null) return null;
      const nom = texte(v.name);
      if (!nom) return null;
      return { id: String(v.id), nom, supplement: prixEuros(v.price ?? v.price_togo ?? v.price_takeaway) ?? 0 };
    })
    .filter((c): c is Choix => !!c);
  if (!choix.length) return null;
  const n = (v: unknown) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
  const min = Math.max(0, n(o.min_choices) ?? n(o.min) ?? (o.required ? 1 : 0));
  const max = Math.max(1, n(o.max_choices) ?? n(o.max) ?? choix.length);
  return { id: String(o.id), nom: texte(o.name) ?? "Option", min: Math.min(min, choix.length), max: Math.max(max, Math.min(min, choix.length)), choix };
}

/**
 * Assemble le catalogue de la borne à partir des trois réponses Zelty.
 * Les plats sans catégorie connue vont dans « Autres ». Seules les catégories
 * qui ont au moins un plat sont gardées, dans l'ordre de Zelty.
 */
export function assemblerCatalogue(platsBruts: unknown, tagsBruts: unknown, optionsBrutes: unknown): Catalogue {
  const options: Record<string, GroupeOptions> = {};
  for (const o of liste(optionsBrutes, "options")) {
    const g = lireOption(o);
    if (g) options[g.id] = g;
  }

  const tags: Categorie[] = liste(tagsBruts, "tags")
    .map((t) => (estObjet(t) && t.id != null && texte(t.name) ? { id: String(t.id), nom: texte(t.name)! } : null))
    .filter((t): t is Categorie => !!t);
  const tagsConnus = new Set(tags.map((t) => t.id));

  const plats = liste(platsBruts, "dishes")
    .map(lirePlat)
    .filter((p): p is Plat => !!p)
    .map((p) => {
      const categories = p.categories.filter((c) => tagsConnus.has(c));
      return {
        ...p,
        categories: categories.length ? categories : ["autres"],
        options: p.options.filter((o) => o in options),
      };
    });

  const utilisees = new Set(plats.flatMap((p) => p.categories));
  const categories = [...tags, { id: "autres", nom: "Autres" }].filter((c) => utilisees.has(c.id));
  return { categories, plats, options };
}
