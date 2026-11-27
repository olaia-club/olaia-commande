import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { Newsreader_400Regular } from "@expo-google-fonts/newsreader";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { SessionProvider } from "@/lib/session";
import { couleurs, polices } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function Racine() {
  const [policesPretes, erreurPolices] = useFonts({ Newsreader_400Regular, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  const pret = policesPretes || Boolean(erreurPolices);

  useEffect(() => {
    if (pret) SplashScreen.hide();
  }, [pret]);

  if (!pret) return null;

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: couleurs.creme },
          headerStyle: { backgroundColor: couleurs.creme },
          headerTintColor: couleurs.marron,
          headerTitleStyle: { fontFamily: polices.gras },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(onglets)" options={{ headerShown: false }} />
        <Stack.Screen name="connexion" options={{ presentation: "modal", title: "Club Olaía" }} />
      </Stack>
    </SessionProvider>
  );
}
