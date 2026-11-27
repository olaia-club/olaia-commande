import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Ecran } from "@/components/ecran";
import { Chargement, Etat, Panneau, Texte, Titre } from "@/components/ui";
import { chargerCarte, prix, type EtatCarte, type Plat } from "@/lib/carte";
import { couleurs, espace, polices, rayon } from "@/lib/theme";

export default function Carte() {
  const [carte, setCarte] = useState<EtatCarte | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [categorie, setCategorie] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setEnCours(true);
    setCarte(await chargerCarte());
    setEnCours(false);
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const sections = useMemo(() => {
    if (!carte || (carte.etat !== "ok" && carte.etat !== "exemple")) return [];
    return carte.categories
      .map((c) => ({ ...c, plats: carte.plats.filter((p) => p.categories.includes(c.id)) }))
      .filter((c) => c.plats.length > 0);
  }, [carte]);

  const visibles = categorie ? sections.filter((s) => s.id === categorie) : sections;

  return (
    <Ecran rafraichir={charger} enCours={enCours && carte !== null}>
      <Titre>La carte</Titre>

      {carte === null ? (
        <Chargement />
      ) : carte.etat === "erreur" ? (
        <Etat titre="La carte ne s'affiche pas" texte={carte.message} action={{ titre: "Réessayer", onPress: charger }} />
      ) : carte.etat === "vide" ? (
        <Etat titre="La carte est vide pour le moment" texte="Repasse un peu plus tard." />
      ) : (
        <>
          {carte.etat === "exemple" ? (
            <Etat titre="Carte d'exemple" texte="Les produits et les prix sont des exemples. La vraie carte s'affichera dès que la caisse sera reliée." />
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espace.s }}>
            <Pastille nom="Tout" active={categorie === null} onPress={() => setCategorie(null)} />
            {sections.map((s) => (
              <Pastille key={s.id} nom={s.nom} active={categorie === s.id} onPress={() => setCategorie(s.id)} />
            ))}
          </ScrollView>

          {visibles.map((s) => (
            <View key={s.id} style={{ gap: espace.s }}>
              <Titre taille={22} style={{ marginTop: espace.s }}>
                {s.nom}
              </Titre>
              {s.plats.map((p) => (
                <LignePlat key={p.id} plat={p} />
              ))}
            </View>
          ))}
        </>
      )}
    </Ecran>
  );
}

function Pastille({ nom, active, onPress }: { nom: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.pastille, active && { backgroundColor: couleurs.marron, borderColor: couleurs.marron }]}
    >
      <Texte style={{ fontFamily: polices.moyen, fontSize: 14, color: active ? couleurs.blanc : couleurs.marron }}>{nom}</Texte>
    </Pressable>
  );
}

function LignePlat({ plat }: { plat: Plat }) {
  return (
    <Panneau style={styles.plat}>
      {plat.photo ? <Image source={{ uri: plat.photo }} style={styles.photo} contentFit="cover" transition={150} accessibilityIgnoresInvertColors /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Texte variante="gras">{plat.nom}</Texte>
        {plat.description ? <Texte variante="petit">{plat.description}</Texte> : null}
      </View>
      <Texte style={{ fontFamily: polices.moyen }}>{prix(plat.prix)}</Texte>
    </Panneau>
  );
}

const styles = StyleSheet.create({
  pastille: { borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.papier, borderRadius: rayon.plein, paddingHorizontal: 14, paddingVertical: 8 },
  plat: { flexDirection: "row", alignItems: "center", gap: espace.m },
  photo: { width: 64, height: 64, borderRadius: rayon.s, backgroundColor: couleurs.sable },
});
