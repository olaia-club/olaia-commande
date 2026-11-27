# Appli client Olaía Club (iPhone et Android)

L'appli que les clients téléchargent (QR « Téléchargez notre application » en fin de commande sur l'iPad). Projet Expo (React Native), à part de l'appli iPad mais dans le même dépôt.

| Onglet | Contenu | D'où viennent les données |
| --- | --- | --- |
| Accueil | Bonjour, aperçu de la carte Club, accès à la carte | — |
| La carte | Cafés, glacés, jus, bowls, douceurs, avec prix | Serveur Olaía `/api/appli/carte`, qui lit Zelty (carte d'exemple signalée tant que Zelty n'est pas branché) |
| Club | Connexion par code SMS, carte avec QR, points, récompenses, bons, historique, déconnexion, suppression du compte | API Club de FIMIO (`/api/club/<club>`), la même que l'appli GREEKIA |
| Infos | Adresse, horaires, liens | `src/lib/infos.ts`, à compléter |

Le QR de la carte contient le numéro de carte (`1234-5678`) : l'appli iPad le lit à la caméra comme une carte Wallet.

## Réglages

Copier `.env.example` en `.env` :

- `EXPO_PUBLIC_OLAIA_API` : le serveur Olaía (par défaut https://olaia-commande.vercel.app).
- `EXPO_PUBLIC_FIMIO_CLUB` : l'adresse courte du restaurant Olaía dans FIMIO. Vide, l'onglet Club dit « le Club arrive bientôt ».

## Lancer

```bash
cd appli
npm install
npx expo start        # puis scanner le QR avec l'appli Expo Go, ou « w » pour le navigateur
npm run typecheck
```

## Publier sur l'App Store et le Play Store

Avec EAS (Expo), dans le cloud : pas besoin de Mac.

1. Compte Apple Developer au nom d'Olaía (99 €/an, numéro D-U-N-S de la société) et compte Google Play Console (25 € une fois).
2. `npx eas-cli@latest login`, puis `npx eas-cli@latest build --platform all --profile production`.
3. `npx eas-cli@latest submit --platform ios` (puis `android`).

Identifiant de l'appli : `club.olaia.appli` (iOS et Android). Il ne change plus après la première publication.
