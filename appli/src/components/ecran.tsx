import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { couleurs, espace } from "@/lib/theme";

/** Écran défilant sur fond crème, avec « tirer pour rafraîchir » si besoin. */
export function Ecran({ children, rafraichir, enCours = false }: { children: ReactNode; rafraichir?: () => void; enCours?: boolean }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.fond}>
      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={rafraichir ? <RefreshControl refreshing={enCours} onRefresh={rafraichir} tintColor={couleurs.marron} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: couleurs.creme },
  contenu: { padding: espace.m, paddingBottom: espace.xl * 2, gap: espace.m },
});
