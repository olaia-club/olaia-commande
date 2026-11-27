import { StyleSheet, View } from "react-native";

import type { Membre } from "@/lib/club";
import { couleurs, espace, polices, rayon } from "@/lib/theme";

import { Qr } from "./qr";
import { Logo, Texte } from "./ui";

/** La carte Club, façon Wallet : marron, logo blanc, points et QR à présenter. */
export function CarteMembre({ membre, avecQr = true }: { membre: Membre; avecQr?: boolean }) {
  return (
    <View style={styles.carte} accessible accessibilityLabel={`Carte Club Olaía, ${membre.points} points`}>
      <View style={styles.haut}>
        <Logo blanc largeur={96} />
        <Texte variante="inverse" style={styles.club}>
          CLUB
        </Texte>
      </View>
      <View style={styles.milieu}>
        <View>
          <Texte variante="inverse" style={styles.etiquette}>
            {membre.prenom ? membre.prenom : "Membre"}
          </Texte>
          <Texte variante="inverse" style={styles.numero}>
            Carte {membre.carte}
          </Texte>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Texte variante="inverse" style={styles.points}>
            {membre.points}
          </Texte>
          <Texte variante="inverse" style={styles.etiquette}>
            {membre.points > 1 ? "points" : "point"}
          </Texte>
        </View>
      </View>
      {avecQr ? (
        <View style={styles.qr}>
          <Qr valeur={membre.carte} taille={168} />
          <Texte variante="petit" style={{ textAlign: "center", color: couleurs.marron }}>
            À montrer en caisse ou à scanner sur l'iPad pour gagner tes points
          </Texte>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.marron, borderRadius: rayon.l, padding: espace.l, gap: espace.l },
  haut: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  club: { fontFamily: polices.gras, letterSpacing: 3, fontSize: 13 },
  milieu: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  etiquette: { fontFamily: polices.moyen, fontSize: 15, opacity: 0.9 },
  numero: { fontSize: 13, opacity: 0.75, marginTop: 2 },
  points: { fontFamily: polices.titre, fontSize: 44, lineHeight: 48 },
  qr: { backgroundColor: couleurs.blanc, borderRadius: rayon.m, padding: espace.m, alignItems: "center", gap: espace.s },
});
