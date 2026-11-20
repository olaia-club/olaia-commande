const nombre = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 4.2 → « 4,20 » */
export const prix = (euros: number) => nombre.format(euros);

/** 4.2 → « 4,20 € » */
export const prixEuro = (euros: number) => `${nombre.format(euros)} €`;

/** Somme en centimes pour éviter les erreurs d'arrondi (0,1 + 0,2). */
export const somme = (valeurs: number[]) => Math.round(valeurs.reduce((t, v) => t + Math.round(v * 100), 0)) / 100;

export const articles = (n: number) => `${n} article${n > 1 ? "s" : ""}`;
