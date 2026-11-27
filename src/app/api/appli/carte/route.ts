import { lireCarte } from "@/lib/zelty/carte";

/**
 * La carte du café pour l'appli client (iPhone, Android) : la même que sur
 * l'iPad, lue dans Zelty, en lecture seule. Sans clé Zelty, la carte d'exemple,
 * marquée « exemple » pour que l'appli l'affiche comme telle.
 *
 * Pas de cookie, pas de donnée client : n'importe quelle origine peut la lire
 * (la version web de l'appli comprise).
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept",
  "Access-Control-Max-Age": "86400",
};

export async function GET(request: Request) {
  // Les photos de la carte d'exemple sont des chemins du site : l'appli a besoin de l'adresse complète.
  const origine = new URL(request.url).origin;
  const absolue = (photo: string | null) => (photo ? new URL(photo, origine).toString() : null);
  const carte = await lireCarte();

  if (carte.etat === "ok" || carte.etat === "exemple") {
    const { categories, plats } = carte.catalogue;
    return Response.json(
      {
        etat: carte.etat,
        categories,
        plats: plats.map((p) => ({
          id: p.id,
          nom: p.nom,
          description: p.description,
          prix: p.prix,
          photo: absolue(p.photo),
          categories: p.categories,
        })),
      },
      { headers: { ...CORS, "Cache-Control": "public, max-age=60" } },
    );
  }
  if (carte.etat === "vide") return Response.json({ etat: "vide" }, { headers: { ...CORS, "Cache-Control": "no-store" } });
  console.error("[appli] carte", carte.message);
  return Response.json(
    { etat: "erreur", message: "La carte ne répond pas pour le moment." },
    { status: 503, headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
