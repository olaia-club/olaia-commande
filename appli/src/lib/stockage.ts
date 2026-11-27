import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Le jeton de session du Club, gardé dans le trousseau du téléphone (Keychain
 * sur iPhone, Keystore sur Android). La version web, qui ne sert qu'à l'aperçu,
 * le garde dans le navigateur.
 */
const CLE = "olaia.club.jeton";

export async function lireJeton(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(CLE) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(CLE).catch(() => null);
}

export async function garderJeton(jeton: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (jeton) globalThis.localStorage?.setItem(CLE, jeton);
      else globalThis.localStorage?.removeItem(CLE);
    } catch {
      // Navigation privée : la session ne survivra pas au rechargement, rien de plus.
    }
    return;
  }
  if (jeton) await SecureStore.setItemAsync(CLE, jeton, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
  else await SecureStore.deleteItemAsync(CLE);
}
