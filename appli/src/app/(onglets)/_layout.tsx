import { Tabs } from "expo-router/js-tabs";
import { Platform } from "react-native";

import { IconeAccueil, IconeCarte, IconeInfo, IconeTasse } from "@/components/icones";
import { couleurs, polices } from "@/lib/theme";

export default function Onglets() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.creme },
        tabBarActiveTintColor: couleurs.marron,
        tabBarInactiveTintColor: couleurs.marronDoux,
        // Sur le web (aperçu), la barre par défaut coupe les libellés.
        tabBarStyle: { backgroundColor: couleurs.papier, borderTopColor: couleurs.trait, ...(Platform.OS === "web" ? { height: 62 } : null) },
        tabBarLabelStyle: { fontFamily: polices.moyen, fontSize: 11, lineHeight: 14 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon: ({ color }) => <IconeAccueil couleur={color} /> }} />
      <Tabs.Screen name="carte" options={{ title: "La carte", tabBarIcon: ({ color }) => <IconeTasse couleur={color} /> }} />
      <Tabs.Screen name="club" options={{ title: "Club", tabBarIcon: ({ color }) => <IconeCarte couleur={color} /> }} />
      <Tabs.Screen name="infos" options={{ title: "Infos", tabBarIcon: ({ color }) => <IconeInfo couleur={color} /> }} />
    </Tabs>
  );
}
