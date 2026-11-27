import * as WebBrowser from "expo-web-browser";
import { Linking, View } from "react-native";

import { Ecran } from "@/components/ecran";
import { Panneau, Texte, Titre } from "@/components/ui";
import { INFOS } from "@/lib/infos";
import { espace } from "@/lib/theme";

const A_VENIR = "À venir";

export default function Infos() {
  return (
    <Ecran>
      <Titre>Infos pratiques</Titre>

      <Panneau style={{ gap: 4 }}>
        <Texte variante="gras">Adresse</Texte>
        <Texte variante={INFOS.adresse ? "normal" : "doux"}>{INFOS.adresse || A_VENIR}</Texte>
        <Texte variante="doux">{INFOS.ville}</Texte>
        {INFOS.itineraire ? <Lien titre="Itinéraire" onPress={() => Linking.openURL(INFOS.itineraire)} /> : null}
      </Panneau>

      <Panneau style={{ gap: 4 }}>
        <Texte variante="gras">Horaires</Texte>
        {INFOS.horaires.length ? INFOS.horaires.map((h) => <Texte key={h}>{h}</Texte>) : <Texte variante="doux">{A_VENIR}</Texte>}
      </Panneau>

      {INFOS.telephone || INFOS.instagram || INFOS.site ? (
        <Panneau style={{ gap: espace.s }}>
          <Texte variante="gras">Nous suivre</Texte>
          <View style={{ gap: espace.s }}>
            {INFOS.telephone ? <Lien titre={INFOS.telephone} onPress={() => Linking.openURL(`tel:${INFOS.telephone.replace(/\s/g, "")}`)} /> : null}
            {INFOS.instagram ? <Lien titre="Instagram" onPress={() => WebBrowser.openBrowserAsync(INFOS.instagram)} /> : null}
            {INFOS.site ? <Lien titre="Site web" onPress={() => WebBrowser.openBrowserAsync(INFOS.site)} /> : null}
          </View>
        </Panneau>
      ) : null}
    </Ecran>
  );
}

function Lien({ titre, onPress }: { titre: string; onPress: () => void }) {
  return (
    <Texte variante="gras" style={{ textDecorationLine: "underline" }} onPress={onPress} accessibilityRole="link">
      {titre}
    </Texte>
  );
}
