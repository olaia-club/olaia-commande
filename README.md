# Olaía · logiciel de commande

Borne de commande sur iPad et back-office pour le coffee shop **Olaía Club** (Lyon), reliés à la caisse **Zelty**. Prévu pour plusieurs sites.

- Maquette validée (16 écrans) : https://claude.ai/artifact/SpqD9EPdCCD1L5WLVQ7QWe
- Document de cadrage : https://claude.ai/artifact/REPvegoWTKsbmmHDQ62uQw

## Principes

- **Zelty est la caisse et la source unique** : carte, photos, prix, options et ruptures viennent de Zelty. L'appli lit les ruptures, elle ne les écrit pas.
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

## L'appli iPad

Ce n'est pas une borne : c'est un logiciel en ligne (SaaS) qu'on ouvre sur l'iPad. Adresse : `/borne`. Sur l'iPad, l'ouvrir dans Safari puis « Ajouter à l'écran d'accueil » pour le plein écran.

| Écran | Adresse | État |
| --- | --- | --- |
| Accueil (vidéo ou photo surf) | `/borne` | fait |
| Carte, fiche produit, commande en cours | `/borne/carte` | fait, lit Zelty |
| Panier, sur place ou à emporter | `/borne/panier` | fait |
| Club Olaía : numéro ou QR de la carte Wallet, inscription, points, carte Wallet (QR ou SMS) | `/borne/panier` | fait, lit FIMIO |
| Écran de fin : merci, numéro de commande, Club, retour à l'accueil après 20 s | `/borne/merci` | fait (aperçu tant que l'envoi n'est pas branché) |
| Envoi à la caisse Zelty et paiement au terminal | | à brancher |
| Points crédités après paiement, récompenses sur l'iPad | | avec le paiement |
| Mode express, back-office | | à venir |

- La carte (plats, catégories, options, prix, photos) est lue dans Zelty et gardée une minute : un plat désactivé dans Zelty disparaît de l'iPad en une à deux minutes.
- Sans `ZELTY_API_KEY`, l'appli affiche une **carte d'exemple** (`src/lib/carte-exemple.ts`, produits et prix imaginés), signalée comme telle sur l'écran. Dès que la clé est ajoutée, la carte Zelty la remplace.
- Si Zelty ne répond pas ou renvoie une carte vide, l'appli l'affiche au lieu d'une carte.
- Après 75 s sans contact, l'appli demande « Tu es toujours là ? », puis vide le panier et revient à l'accueil.
- Le Club vit dans **FIMIO**, logiciel à part avec son propre compte Olaía : l'appli ne garde ni carte ni point. Elle utilise l'API borne de FIMIO (son nom dans FIMIO) avec `FIMIO_BORNE_CLE` (générée dans FIMIO > Fidélité > Borne). Le client tape son portable ou montre le QR de sa carte Wallet à la caméra avant (lu sur l'iPad avec jsQR, l'image ne part nulle part). L'appli retrouve sa carte ou la crée (prénom, accord SMS facultatif) et affiche son solde et sa prochaine récompense. Carte créée : QR à scanner avec son téléphone pour l'ajouter au Wallet. Carte existante : « Recevoir ma carte Wallet par SMS », envoyé par FIMIO au numéro de la carte seulement. La carte Wallet se met à jour toute seule quand les points changent dans FIMIO. Seuls le prénom et le solde reviennent vers l'iPad. Sans clé, l'écran dit « pas encore relié à FIMIO ».
- Les points de la commande seront envoyés à FIMIO après le paiement (`crediterCommande` dans `src/lib/fimio/club.ts`, prêt, appelé quand le terminal sera branché). FIMIO ignore un deuxième envoi de la même commande.
- Les allergènes ne viennent pas de Zelty : la fiche renvoie vers l'équipe tant que le back-office ne les gère pas.

## Organisation

```
src/app/borne/        écrans de l'appli iPad
src/components/borne/ panier, fiche produit, carte, inactivité
src/lib/zelty/        lecture de la carte Zelty (envoi des commandes à venir)
src/lib/supabase/     clients Supabase (navigateur, serveur, admin)
```
