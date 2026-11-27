import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { CarteMembre } from "@/components/carte-membre";
import { Ecran } from "@/components/ecran";
import { Bouton, Chargement, Etat, Panneau, Texte, Titre } from "@/components/ui";
import { clubRelie, echangerRecompense, etatWallet, supprimerCompte, type Bon, type CarteClub, type Recompense } from "@/lib/club";
import { useSession } from "@/lib/session";
import { couleurs, espace } from "@/lib/theme";

export default function Club() {
  const { session, rafraichir } = useSession();
  const [enCours, setEnCours] = useState(false);

  const recharger = useCallback(async () => {
    setEnCours(true);
    await rafraichir();
    setEnCours(false);
  }, [rafraichir]);

  // Les points gagnés en caisse doivent apparaître en revenant sur l'onglet.
  const aRafraichir = useRef(rafraichir);
  useEffect(() => {
    aRafraichir.current = rafraichir;
  }, [rafraichir]);
  useFocusEffect(
    useCallback(() => {
      aRafraichir.current();
    }, []),
  );

  if (!clubRelie()) {
    return (
      <Ecran>
        <Titre>Club Olaía</Titre>
        <Etat titre="Le Club arrive bientôt dans l'appli" texte="Tu pourras bientôt retrouver ta carte et tes points ici. En attendant, ta carte fonctionne au comptoir." />
      </Ecran>
    );
  }

  if (session.etat === "chargement") {
    return (
      <Ecran>
        <Titre>Club Olaía</Titre>
        <Chargement />
      </Ecran>
    );
  }

  if (session.etat === "deconnecte") {
    return (
      <Ecran>
        <Titre>Club Olaía</Titre>
        <Panneau style={{ gap: espace.s }}>
          <Texte variante="gras">1 € dépensé = 1 point</Texte>
          <Texte variante="doux">
            Connecte-toi avec ton numéro de portable : tu reçois un code par SMS. Si tu as déjà une carte prise sur l'iPad, tu la retrouves avec tes points.
          </Texte>
          <Bouton titre="Me connecter" onPress={() => router.push("/connexion")} style={{ marginTop: espace.s }} />
        </Panneau>
      </Ecran>
    );
  }

  const { carte, erreur, jeton } = session;
  return (
    <Ecran rafraichir={recharger} enCours={enCours}>
      <Titre>Ma carte</Titre>
      {erreur ? <Etat titre="Ta carte n'est pas à jour" texte={erreur} action={{ titre: "Réessayer", onPress: recharger }} /> : null}
      {carte ? <Contenu carte={carte} jeton={jeton} /> : !erreur ? <Chargement /> : null}
    </Ecran>
  );
}

function Contenu({ carte, jeton }: { carte: CarteClub; jeton: string }) {
  const { membre, recompenses, bons, historique } = carte;
  const actifs = bons.filter((b) => !b.servi_le && !b.annule_le && (!b.expire_le || b.expire_le >= new Date().toISOString().slice(0, 10)));

  return (
    <>
      <CarteMembre membre={membre} />
      <Wallet jeton={jeton} />

      {actifs.length ? (
        <View style={{ gap: espace.s }}>
          <Titre taille={22}>Mes bons</Titre>
          {actifs.map((b) => (
            <LigneBon key={b.id} bon={b} />
          ))}
        </View>
      ) : null}

      {recompenses.length ? (
        <View style={{ gap: espace.s }}>
          <Titre taille={22}>Récompenses</Titre>
          {recompenses.map((r) => (
            <LigneRecompense key={r.id} recompense={r} solde={membre.points} jeton={jeton} />
          ))}
        </View>
      ) : null}

      {historique.length ? (
        <View style={{ gap: espace.s }}>
          <Titre taille={22}>Historique</Titre>
          <Panneau style={{ gap: espace.s }}>
            {historique.slice(0, 15).map((m) => (
              <View key={m.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: espace.m }}>
                <View style={{ flex: 1 }}>
                  <Texte>{m.libelle}</Texte>
                  <Texte variante="petit">{new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</Texte>
                </View>
                <Texte variante="gras">{m.delta > 0 ? `+${m.delta}` : m.delta}</Texte>
              </View>
            ))}
          </Panneau>
        </View>
      ) : null}

      <Compte jeton={jeton} />
    </>
  );
}

/** Ajout au Wallet : FIMIO dit s'il est ouvert. Tant qu'il ne l'est pas, on le dit. */
function Wallet({ jeton }: { jeton: string }) {
  const [etat, setEtat] = useState<{ apple: boolean; google: boolean } | null>(null);
  useEffect(() => {
    etatWallet(jeton)
      .then(setEtat)
      .catch(() => setEtat({ apple: false, google: false }));
  }, [jeton]);
  if (!etat || etat.apple || etat.google) return null; // ouvert : le bouton viendra avec FIMIO
  return <Texte variante="petit">L'ajout de la carte au Wallet du téléphone arrive bientôt.</Texte>;
}

function LigneBon({ bon }: { bon: Bon }) {
  return (
    <Panneau style={{ gap: 4 }}>
      <Texte variante="gras">{bon.libelle}</Texte>
      <Texte style={{ fontSize: 22, letterSpacing: 2 }}>{bon.code}</Texte>
      <Texte variante="petit">
        À montrer en caisse{bon.expire_le ? `, valable jusqu'au ${new Date(bon.expire_le).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : ""}
      </Texte>
    </Panneau>
  );
}

function LigneRecompense({ recompense, solde, jeton }: { recompense: Recompense; solde: number; jeton: string }) {
  const { rafraichir } = useSession();
  const [confirmer, setConfirmer] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const manque = recompense.points - solde;

  const echanger = async () => {
    setOccupe(true);
    setMessage(null);
    try {
      const { bon } = await echangerRecompense(jeton, recompense.id);
      setMessage(`C'est fait : ton bon ${bon.code} t'attend dans « Mes bons ».`);
      setConfirmer(false);
      await rafraichir();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "L'échange n'a pas marché.");
    } finally {
      setOccupe(false);
    }
  };

  return (
    <Panneau style={{ gap: espace.s }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: espace.m }}>
        <Texte variante="gras" style={{ flex: 1 }}>
          {recompense.libelle}
        </Texte>
        <Texte>{recompense.points} pts</Texte>
      </View>
      <Barre part={Math.min(1, solde / Math.max(1, recompense.points))} />
      {manque > 0 ? (
        <Texte variante="petit">Encore {manque} points</Texte>
      ) : confirmer ? (
        <View style={{ flexDirection: "row", gap: espace.s }}>
          <Bouton titre="Confirmer" onPress={echanger} occupe={occupe} style={{ flex: 1 }} />
          <Bouton secondaire titre="Annuler" onPress={() => setConfirmer(false)} style={{ flex: 1 }} />
        </View>
      ) : (
        <Bouton secondaire titre={`Échanger ${recompense.points} points`} onPress={() => setConfirmer(true)} />
      )}
      {message ? <Texte variante="petit">{message}</Texte> : null}
    </Panneau>
  );
}

function Barre({ part }: { part: number }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: couleurs.sable, overflow: "hidden" }}>
      <View style={{ width: `${Math.round(part * 100)}%`, height: "100%", backgroundColor: couleurs.marron }} />
    </View>
  );
}

/** Déconnexion et suppression du compte (exigée par Apple pour une appli avec compte). */
function Compte({ jeton }: { jeton: string }) {
  const { fermer, oublier } = useSession();
  const [etape, setEtape] = useState<"repos" | "confirmer">("repos");
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const supprimer = async () => {
    setOccupe(true);
    setErreur(null);
    try {
      await supprimerCompte(jeton);
      await oublier();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "La suppression n'a pas marché.");
      setOccupe(false);
    }
  };

  return (
    <View style={{ gap: espace.s, marginTop: espace.l }}>
      <Bouton secondaire titre="Me déconnecter" onPress={fermer} />
      {etape === "repos" ? (
        <Texte variante="petit" style={{ textAlign: "center", textDecorationLine: "underline", paddingVertical: espace.s }} onPress={() => setEtape("confirmer")} accessibilityRole="button">
          Supprimer mon compte
        </Texte>
      ) : (
        <Panneau style={{ gap: espace.s }}>
          <Texte variante="gras">Supprimer ton compte Club ?</Texte>
          <Texte variante="doux">Ta carte, tes points et tes bons seront effacés. On ne pourra pas les retrouver.</Texte>
          <Bouton titre="Oui, tout supprimer" onPress={supprimer} occupe={occupe} />
          <Bouton secondaire titre="Garder mon compte" onPress={() => setEtape("repos")} />
          {erreur ? <Texte variante="petit" style={{ color: couleurs.alerte }}>{erreur}</Texte> : null}
        </Panneau>
      )}
    </View>
  );
}
