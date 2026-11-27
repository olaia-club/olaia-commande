import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ErreurClub, lireCarteClub, seDeconnecter, type CarteClub } from "./club";
import { garderJeton, lireJeton } from "./stockage";

/**
 * La session Club de l'appli : le jeton FIMIO et la dernière carte lue.
 * « chargement » tant qu'on relit le trousseau au lancement.
 */
type Etat =
  | { etat: "chargement" }
  | { etat: "deconnecte" }
  | { etat: "connecte"; jeton: string; carte: CarteClub | null; erreur: string | null };

type Session = {
  session: Etat;
  /** Après la connexion par code : garde le jeton et lit la carte. */
  ouvrir: (jeton: string) => Promise<void>;
  rafraichir: () => Promise<void>;
  fermer: () => Promise<void>;
  /** Le compte a été supprimé : on oublie le jeton sans rappeler FIMIO. */
  oublier: () => Promise<void>;
};

const Contexte = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Etat>({ etat: "chargement" });

  const charger = useCallback(async (jeton: string) => {
    try {
      const carte = await lireCarteClub(jeton);
      setSession({ etat: "connecte", jeton, carte, erreur: null });
    } catch (e) {
      if (e instanceof ErreurClub && e.statut === 401) {
        // Session expirée ou carte supprimée : retour à l'écran de connexion.
        await garderJeton(null);
        setSession({ etat: "deconnecte" });
        return;
      }
      const message = e instanceof Error ? e.message : "Le Club ne répond pas pour le moment.";
      setSession((s) => ({ etat: "connecte", jeton, carte: s.etat === "connecte" ? s.carte : null, erreur: message }));
    }
  }, []);

  useEffect(() => {
    lireJeton().then((jeton) => (jeton ? charger(jeton) : setSession({ etat: "deconnecte" })));
  }, [charger]);

  const valeur = useMemo<Session>(
    () => ({
      session,
      ouvrir: async (jeton) => {
        await garderJeton(jeton);
        setSession({ etat: "connecte", jeton, carte: null, erreur: null });
        await charger(jeton);
      },
      rafraichir: async () => {
        if (session.etat === "connecte") await charger(session.jeton);
      },
      fermer: async () => {
        if (session.etat === "connecte") await seDeconnecter(session.jeton).catch(() => undefined);
        await garderJeton(null);
        setSession({ etat: "deconnecte" });
      },
      oublier: async () => {
        await garderJeton(null);
        setSession({ etat: "deconnecte" });
      },
    }),
    [session, charger],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useSession(): Session {
  const s = useContext(Contexte);
  if (!s) throw new Error("useSession hors de SessionProvider");
  return s;
}
