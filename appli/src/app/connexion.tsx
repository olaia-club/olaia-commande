import { router } from "expo-router";
import { useRef, useState, type ComponentRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { Bouton, Texte, Titre } from "@/components/ui";
import { demanderCode, modifierProfil, portable, portableLisible, seConnecter } from "@/lib/club";
import { useSession } from "@/lib/session";
import { couleurs, espace, polices, rayon } from "@/lib/theme";

/**
 * Connexion au Club par le portable : FIMIO envoie un code à 6 chiffres par SMS,
 * l'appli l'envoie à FIMIO, qui ouvre une session (et crée la carte la première
 * fois, avec le bonus de bienvenue). Ensuite, le prénom si la carte n'en a pas.
 */
type Etape = "numero" | "code" | "prenom";

export default function Connexion() {
  const { ouvrir, rafraichir } = useSession();
  const [etape, setEtape] = useState<Etape>("numero");
  const [numero, setNumero] = useState("");
  const [envoyeA, setEnvoyeA] = useState("");
  const [code, setCode] = useState("");
  const [jeton, setJeton] = useState<string | null>(null);
  const [prenom, setPrenom] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const champCode = useRef<ComponentRef<typeof TextInput>>(null);

  const telephone = portable(numero);

  const agir = async (action: () => Promise<void>) => {
    setOccupe(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Ça n'a pas marché. Réessaie.");
    } finally {
      setOccupe(false);
    }
  };

  const envoyerCode = () =>
    agir(async () => {
      if (!telephone) throw new Error("Un numéro de portable en 06 ou 07, sur 10 chiffres.");
      const r = await demanderCode(telephone);
      setEnvoyeA(r.envoyeA);
      setCode("");
      setEtape("code");
      setTimeout(() => champCode.current?.focus(), 300);
    });

  const verifierCode = (saisie = code) =>
    agir(async () => {
      if (!telephone || !/^\d{6}$/.test(saisie)) throw new Error("Le code fait 6 chiffres.");
      const r = await seConnecter(telephone, saisie, `Appli Olaía · ${Platform.OS}`);
      await ouvrir(r.jeton);
      if (r.membre.profil_complet) router.back();
      else {
        setJeton(r.jeton);
        setEtape("prenom");
      }
    });

  const enregistrerPrenom = () =>
    agir(async () => {
      if (!jeton) return;
      if (prenom.trim()) {
        await modifierProfil(jeton, { prenom: prenom.trim() });
        await rafraichir();
      }
      router.back();
    });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: couleurs.creme }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {etape === "numero" ? (
          <>
            <Titre>Ton numéro de portable</Titre>
            <Texte variante="doux">On t'envoie un code par SMS. Si tu as déjà une carte Olaía, tu la retrouves avec tes points.</Texte>
            <TextInput
              style={styles.champ}
              value={portableLisible(numero)}
              onChangeText={(t) => setNumero(t.replace(/\D/g, "").slice(0, 10))}
              placeholder="06 12 34 56 78"
              placeholderTextColor={couleurs.marronDoux}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              autoFocus
              returnKeyType="send"
              onSubmitEditing={envoyerCode}
              accessibilityLabel="Numéro de portable"
            />
            <Bouton titre="Recevoir le code" onPress={envoyerCode} occupe={occupe} desactive={!telephone} />
          </>
        ) : etape === "code" ? (
          <>
            <Titre>Le code reçu par SMS</Titre>
            <Texte variante="doux">Envoyé au {envoyeA}. Il est valable 10 minutes.</Texte>
            <TextInput
              ref={champCode}
              style={[styles.champ, styles.champCode]}
              value={code}
              onChangeText={(t) => {
                const v = t.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                if (v.length === 6) verifierCode(v);
              }}
              placeholder="••••••"
              placeholderTextColor={couleurs.marronDoux}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={6}
              accessibilityLabel="Code à 6 chiffres"
            />
            <Bouton titre="Valider" onPress={() => verifierCode()} occupe={occupe} desactive={code.length !== 6} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Texte variante="petit" style={styles.lien} onPress={() => setEtape("numero")} accessibilityRole="button">
                Changer de numéro
              </Texte>
              <Texte variante="petit" style={styles.lien} onPress={envoyerCode} accessibilityRole="button">
                Renvoyer le code
              </Texte>
            </View>
          </>
        ) : (
          <>
            <Titre>Bienvenue au Club</Titre>
            <Texte variante="doux">Comment on t'appelle ? C'est pour te saluer en caisse et sur l'iPad.</Texte>
            <TextInput
              style={styles.champ}
              value={prenom}
              onChangeText={setPrenom}
              placeholder="Ton prénom"
              placeholderTextColor={couleurs.marronDoux}
              textContentType="givenName"
              autoComplete="given-name"
              autoCapitalize="words"
              maxLength={40}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={enregistrerPrenom}
              accessibilityLabel="Prénom"
            />
            <Bouton titre="C'est parti" onPress={enregistrerPrenom} occupe={occupe} />
          </>
        )}
        {erreur ? (
          <Texte style={{ color: couleurs.alerte }} accessibilityLiveRegion="polite">
            {erreur}
          </Texte>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.m },
  champ: {
    backgroundColor: couleurs.papier,
    borderWidth: 1,
    borderColor: couleurs.trait,
    borderRadius: rayon.m,
    paddingHorizontal: espace.m,
    minHeight: 56,
    fontFamily: polices.moyen,
    fontSize: 22,
    color: couleurs.marron,
  },
  champCode: { letterSpacing: 10, textAlign: "center" },
  lien: { textDecorationLine: "underline", paddingVertical: espace.s },
});
