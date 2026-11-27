import { router } from "expo-router";
import { View } from "react-native";

import { CarteMembre } from "@/components/carte-membre";
import { Ecran } from "@/components/ecran";
import { Bouton, Logo, Panneau, Texte, Titre } from "@/components/ui";
import { clubRelie } from "@/lib/club";
import { useSession } from "@/lib/session";
import { espace } from "@/lib/theme";

export default function Accueil() {
  const { session } = useSession();
  const membre = session.etat === "connecte" ? session.carte?.membre : undefined;

  return (
    <Ecran>
      <View style={{ alignItems: "center", paddingVertical: espace.l }}>
        <Logo largeur={150} />
      </View>

      <Titre>{membre?.prenom ? `Bonjour ${membre.prenom}` : "Bienvenue chez Olaía"}</Titre>

      {membre ? (
        <>
          <CarteMembre membre={membre} avecQr={false} />
          <Bouton titre="Montrer ma carte" onPress={() => router.navigate("/club")} />
        </>
      ) : session.etat === "deconnecte" ? (
        <Panneau style={{ gap: espace.s }}>
          <Texte variante="gras">Le Club Olaía</Texte>
          <Texte variante="doux">1 € dépensé = 1 point. Tes points se changent en douceurs et en boissons offertes.</Texte>
          {clubRelie() ? (
            <Bouton titre="Rejoindre le Club" onPress={() => router.push("/connexion")} style={{ marginTop: espace.s }} />
          ) : (
            <Texte variante="petit">Le Club arrive bientôt dans l'appli.</Texte>
          )}
        </Panneau>
      ) : null}

      <Panneau sable style={{ gap: espace.s }}>
        <Texte variante="gras">La carte du café</Texte>
        <Texte variante="doux">Cafés, glacés, jus, bowls et douceurs.</Texte>
        <Bouton secondaire titre="Voir la carte" onPress={() => router.navigate("/carte")} style={{ marginTop: espace.s }} />
      </Panneau>
    </Ecran>
  );
}
