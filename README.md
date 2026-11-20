# Olaía · logiciel de commande

Borne de commande sur iPad et back-office pour le coffee shop **Olaía Club** (Lyon), reliés à la caisse **Zelty**. Prévu pour plusieurs sites.

- Maquette validée (16 écrans) : https://claude.ai/artifact/SpqD9EPdCCD1L5WLVQ7QWe
- Document de cadrage : https://claude.ai/artifact/REPvegoWTKsbmmHDQ62uQw

## Principes

- **Zelty est la caisse et la source unique** : carte, photos, prix, options et ruptures viennent de Zelty. La borne lit les ruptures, elle ne les écrit pas.
- **L'écran cuisine est celui de Zelty** (KDS sur un deuxième iPad) : les commandes et leurs personnalisations partent dans Zelty.
- **Club Olaía avec FIMIO** : 1 € = 1 point, crédités après paiement. Trois statuts (Sable, Écume, Golden hour) qui correspondent à Bronze, Argent et Or dans FIMIO.
- **Pas de paiement bancaire maison** : on pilote le terminal existant.
- **Ne jamais simuler une intégration** : tant qu'un endpoint Zelty ou FIMIO n'est pas confirmé, l'écran le dit au lieu d'inventer des données.

## Pile

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase (PostgreSQL, auth du back-office)
- Hébergement Vercel

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Ouvre http://localhost:3000.

## Charte

Les couleurs et polices sont dans `src/app/globals.css` : crème `#F4EEE7`, papier `#FBF8F4`, sable `#E5D9CB`, marron `#541F09`. Newsreader pour les titres, DM Sans pour l'interface. Logos dans `public/brand/`.

## La borne iPad

Adresse : `/borne`. Sur l'iPad, l'ouvrir dans Safari puis « Ajouter à l'écran d'accueil » pour le plein écran.

| Écran | Adresse | État |
| --- | --- | --- |
| Accueil (vidéo ou photo surf) | `/borne` | fait |
| Carte, fiche produit, commande en cours | `/borne/carte` | fait, lit Zelty |
| Panier, sur place ou à emporter | `/borne/panier` | fait |
| Envoi à la caisse Zelty et paiement au terminal | | à brancher |
| Club Olaía, mode express, back-office | | à venir |

- La carte (plats, catégories, options, prix, photos) est lue dans Zelty et gardée une minute : un plat désactivé dans Zelty disparaît de l'iPad en une à deux minutes.
- Sans `ZELTY_API_KEY`, la borne affiche une **carte d'exemple** (`src/lib/carte-exemple.ts`, produits et prix imaginés), signalée comme telle sur l'écran. Dès que la clé est ajoutée, la carte Zelty la remplace.
- Si Zelty ne répond pas ou renvoie une carte vide, la borne l'affiche au lieu d'une carte.
- Après 75 s sans contact, la borne demande « Tu es toujours là ? », puis vide le panier et revient à l'accueil.
- Les allergènes ne viennent pas de Zelty : la fiche renvoie vers l'équipe tant que le back-office ne les gère pas.

## Organisation

```
src/app/borne/        écrans de la borne iPad
src/components/borne/ panier, fiche produit, carte, inactivité
src/lib/zelty/        lecture de la carte Zelty (envoi des commandes à venir)
src/lib/supabase/     clients Supabase (navigateur, serveur, admin)
```
