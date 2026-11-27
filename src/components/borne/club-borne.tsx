"use client";

import { useState, useTransition } from "react";

import { chercherMembre, chercherParScan, envoyerCarte, inscrireMembre, type ReponseClub } from "@/app/borne/club-actions";
import { telephoneLisible, type MembreClub, type RecompenseClub } from "@/lib/fimio/lecture";

import { ScanCarte } from "./scan-carte";
import { prixEuro } from "./format";
import { usePanier } from "./panier-context";

/**
 * Le Club Olaía dans le panier : le client tape son portable ou montre le QR de
 * sa carte Wallet, la borne retrouve sa carte dans FIMIO (ou la crée) et
 * affiche ses points. Les points de la commande sont crédités par FIMIO après
 * le paiement, et sa carte Wallet se met à jour toute seule.
 */

const soldeLisible = (m: MembreClub) => (m.mode === "cagnotte" ? prixEuro(m.solde / 100) : `${m.solde} point${m.solde > 1 ? "s" : ""}`);

export function ClubBorne({ configure }: { configure: boolean }) {
  const { membre, choisirMembre } = usePanier();
  const [ouvert, setOuvert] = useState(false);

  if (!configure) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-trait px-6 py-4">
        <p className="text-base font-semibold">Club Olaía</p>
        <p className="mt-0.5 text-sm text-marron-doux">Pas encore relié à FIMIO : les points ne sont pas comptés pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <>
      {membre ? (
        <div className="flex items-center gap-4 rounded-3xl bg-papier px-6 py-4">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marron font-serif text-2xl text-papier">
            O
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{membre.prenom ? `Club · ${membre.prenom}` : "Club Olaía"}</p>
            <p className="text-base text-marron-doux">{soldeLisible(membre)}</p>
          </div>
          <button
            type="button"
            onClick={() => choisirMembre(null)}
            aria-label="Retirer ma carte du Club"
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl active:bg-sable"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="flex h-[76px] items-center justify-between rounded-3xl border-2 border-marron px-6 text-left active:bg-sable"
        >
          <span>
            <span className="block text-lg font-semibold">Club Olaía</span>
            <span className="block text-sm text-marron-doux">Ton numéro, et tu cumules des points</span>
          </span>
          <span aria-hidden className="text-2xl">
            →
          </span>
        </button>
      )}
      {ouvert && (
        <FenetreClub
          fermer={() => setOuvert(false)}
          valider={(m) => {
            choisirMembre(m);
            setOuvert(false);
          }}
        />
      )}
    </>
  );
}

type Etape =
  | { nom: "numero"; message?: string }
  | { nom: "scan"; message?: string }
  | { nom: "inscription"; message?: string }
  | { nom: "membre"; membre: MembreClub; recompenses: RecompenseClub[]; nouveau: boolean; qrWallet: string | null; carteParSms: boolean }
  | { nom: "indisponible"; message: string };

function FenetreClub({ fermer, valider }: { fermer: () => void; valider: (m: MembreClub) => void }) {
  const [chiffres, setChiffres] = useState("");
  const [prenom, setPrenom] = useState("");
  const [sms, setSms] = useState(false);
  const [etape, setEtape] = useState<Etape>({ nom: "numero" });
  const [enCours, demarrer] = useTransition();

  const suite = (r: ReponseClub, depuis: "numero" | "scan" | "inscription") => {
    if (r.etat === "membre") setEtape({ nom: "membre", ...r });
    else if (r.etat === "inconnu") setEtape({ nom: "inscription" });
    else if (r.etat === "invalide") setEtape({ nom: depuis, message: r.message });
    else setEtape({ nom: "indisponible", message: r.message });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-marron-fonce/40 backdrop-blur-[2px]" onClick={fermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="club-titre"
        className="relative flex w-[620px] flex-col items-center rounded-[32px] bg-papier px-12 pt-12 pb-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={fermer} aria-label="Fermer" className="absolute top-5 right-5 flex size-14 items-center justify-center rounded-full text-3xl active:bg-sable">
          ×
        </button>

        {(etape.nom === "numero" || etape.nom === "scan") && (
          <>
            <h2 id="club-titre" className="font-serif text-5xl leading-tight">
              Club Olaía
            </h2>
            <div role="tablist" aria-label="Comment retrouver ta carte" className="mt-5 grid w-full grid-cols-2 rounded-full bg-creme p-1.5">
              {(
                [
                  ["numero", "Mon numéro"],
                  ["scan", "Ma carte Wallet"],
                ] as const
              ).map(([nom, libelle]) => (
                <button
                  key={nom}
                  type="button"
                  role="tab"
                  aria-selected={etape.nom === nom}
                  onClick={() => setEtape({ nom })}
                  className="h-14 rounded-full text-lg font-semibold text-marron-doux aria-selected:bg-marron aria-selected:text-papier"
                >
                  {libelle}
                </button>
              ))}
            </div>
          </>
        )}

        {etape.nom === "scan" && (
          <ScanCarte
            message={etape.message}
            enCours={enCours}
            lu={(valeur) => demarrer(async () => suite(await chercherParScan(valeur), "scan"))}
            sansCamera={() => setEtape({ nom: "numero" })}
          />
        )}

        {etape.nom === "numero" && (
          <>
            <p aria-live="polite" className="mt-5 flex h-16 w-full items-center justify-center rounded-2xl bg-creme font-serif text-4xl tracking-wide">
              {chiffres ? telephoneLisible(chiffres) : <span className="text-marron-doux/60">06 __ __ __ __</span>}
            </p>
            <p role="alert" className="mt-2 h-6 text-base font-semibold text-marron">
              {etape.message}
            </p>
            <Pave
              chiffres={chiffres}
              changer={(c) => {
                setChiffres(c);
                if (etape.message) setEtape({ nom: "numero" });
              }}
            />
            <button
              type="button"
              disabled={chiffres.length !== 10 || enCours}
              onClick={() => demarrer(async () => suite(await chercherMembre(chiffres), "numero"))}
              className="mt-6 flex h-[76px] w-full items-center justify-center rounded-full bg-marron text-xl font-semibold text-papier active:bg-marron-fonce disabled:opacity-35"
            >
              {enCours ? "Recherche de ta carte…" : "Retrouver ma carte"}
            </button>
          </>
        )}

        {etape.nom === "inscription" && (
          <form
            className="flex w-full flex-col items-center"
            onSubmit={(e) => {
              e.preventDefault();
              demarrer(async () => suite(await inscrireMembre(chiffres, prenom, sms), "inscription"));
            }}
          >
            <h2 id="club-titre" className="font-serif text-5xl leading-tight">
              Bienvenue au Club
            </h2>
            <p className="mt-2 text-lg text-marron-doux">
              Pas encore de carte au {telephoneLisible(chiffres)}. On la crée, il manque juste ton prénom.
            </p>
            <label className="mt-8 w-full text-left text-base font-semibold" htmlFor="club-prenom">
              Prénom
            </label>
            <input
              id="club-prenom"
              autoFocus
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="done"
              maxLength={40}
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-2 h-16 w-full rounded-2xl border-2 border-trait bg-creme px-5 text-2xl outline-none focus:border-marron"
            />
            <label className="mt-5 flex w-full cursor-pointer items-center gap-4 text-left text-base">
              <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="size-7 shrink-0 accent-marron" />
              <span>Je veux recevoir les offres du Club par SMS (désinscription à tout moment).</span>
            </label>
            <p role="alert" className="mt-3 h-6 text-base font-semibold text-marron">
              {etape.message}
            </p>
            <div className="mt-3 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setEtape({ nom: "numero" })}
                className="flex h-[76px] items-center rounded-full border-2 border-trait px-8 text-lg font-semibold active:bg-sable"
              >
                Changer de numéro
              </button>
              <button
                type="submit"
                disabled={!prenom.trim() || enCours}
                className="flex h-[76px] flex-1 items-center justify-center rounded-full bg-marron text-xl font-semibold text-papier active:bg-marron-fonce disabled:opacity-35"
              >
                {enCours ? "Création…" : "Créer ma carte"}
              </button>
            </div>
          </form>
        )}

        {etape.nom === "membre" && <CarteMembre {...etape} valider={() => valider(etape.membre)} />}

        {etape.nom === "indisponible" && (
          <>
            <p className="rounded-full bg-sable px-4 py-1.5 text-sm font-semibold">FIMIO ne répond pas</p>
            <h2 id="club-titre" className="mt-5 font-serif text-5xl leading-tight">
              Le Club fait une pause
            </h2>
            <p className="mt-3 text-xl leading-relaxed text-marron-doux">{etape.message}</p>
            <button type="button" onClick={fermer} className="mt-8 flex h-16 items-center rounded-full border-2 border-trait px-8 text-lg font-semibold active:bg-sable">
              Continuer sans le Club
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Pave({ chiffres, changer }: { chiffres: string; changer: (c: string) => void }) {
  const touche = "flex h-[72px] items-center justify-center rounded-2xl bg-creme text-3xl font-semibold active:bg-sable disabled:opacity-35";
  return (
    <div className="mt-2 grid w-full grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((c) => (
        <button key={c} type="button" disabled={chiffres.length >= 10} onClick={() => changer(chiffres + c)} className={touche}>
          {c}
        </button>
      ))}
      <button type="button" disabled={!chiffres} onClick={() => changer("")} className={`${touche} text-lg`}>
        Effacer
      </button>
      <button type="button" disabled={chiffres.length >= 10} onClick={() => changer(chiffres + "0")} className={touche}>
        0
      </button>
      <button type="button" disabled={!chiffres} onClick={() => changer(chiffres.slice(0, -1))} aria-label="Effacer un chiffre" className={touche}>
        ⌫
      </button>
    </div>
  );
}

function CarteMembre({
  membre,
  recompenses,
  nouveau,
  qrWallet,
  carteParSms,
  valider,
}: {
  membre: MembreClub;
  recompenses: RecompenseClub[];
  nouveau: boolean;
  qrWallet: string | null;
  carteParSms: boolean;
  valider: () => void;
}) {
  const dispo = recompenses.filter((r) => r.cout <= membre.solde);
  const prochaine = recompenses.find((r) => r.cout > membre.solde);
  const titre = membre.prenom ? `${nouveau ? "Bienvenue" : "Bonjour"} ${membre.prenom}` : nouveau ? "Bienvenue au Club" : "Bonjour";
  const [sms, setSms] = useState<{ etat: "pret" | "envoi" | "envoye" } | { etat: "erreur"; message: string }>({ etat: "pret" });
  return (
    <>
      <h2 id="club-titre" className="font-serif text-5xl leading-tight">
        {titre}
      </h2>
      <p className="mt-2 text-lg text-marron-doux">{nouveau ? "Ta carte du Club est créée." : "On a retrouvé ta carte du Club."}</p>
      <div className="mt-7 flex w-full items-center gap-6 rounded-3xl bg-sable/70 px-8 py-6 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-marron-doux">{membre.mode === "cagnotte" ? "Ta cagnotte" : "Tes points"}</p>
          <p className="font-serif text-7xl leading-none">{membre.mode === "cagnotte" ? prixEuro(membre.solde / 100) : membre.solde}</p>
          {prochaine && (
            <>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-papier" aria-hidden>
                <div className="h-full rounded-full bg-marron" style={{ width: `${Math.min(100, (membre.solde / prochaine.cout) * 100)}%` }} />
              </div>
              <p className="mt-2 text-base">
                Encore {prochaine.cout - membre.solde} points avant : <span className="font-semibold">{prochaine.nom}</span>
              </p>
            </>
          )}
          {dispo.length > 0 && (
            <p className="mt-3 text-base">
              Déjà à toi : <span className="font-semibold">{dispo.map((r) => r.nom).join(", ")}</span>
            </p>
          )}
        </div>
        {qrWallet && (
          <figure className="flex w-[150px] shrink-0 flex-col items-center gap-2">
            <span className="block size-[132px] rounded-2xl bg-papier p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/svg+xml;utf8,${encodeURIComponent(qrWallet)}`} alt="QR code de ta carte" className="size-full" />
            </span>
            <figcaption className="text-center text-sm leading-snug">Scanne avec ton téléphone pour l&apos;ajouter à ton Wallet</figcaption>
          </figure>
        )}
      </div>
      {carteParSms && (
        <div className="mt-4 flex h-14 w-full items-center justify-center">
          {sms.etat === "envoye" ? (
            <p className="text-base font-semibold">SMS envoyé : ouvre le lien pour ajouter ta carte à ton Wallet.</p>
          ) : sms.etat === "erreur" ? (
            <p className="text-base font-semibold">{sms.message}</p>
          ) : (
            <button
              type="button"
              disabled={sms.etat === "envoi"}
              onClick={async () => {
                setSms({ etat: "envoi" });
                const r = await envoyerCarte(membre.id);
                setSms(r.ok ? { etat: "envoye" } : { etat: "erreur", message: r.message });
              }}
              className="flex h-14 items-center rounded-full border-2 border-trait px-7 text-base font-semibold active:bg-sable disabled:opacity-50"
            >
              {sms.etat === "envoi" ? "Envoi…" : "Recevoir ma carte Wallet par SMS"}
            </button>
          )}
        </div>
      )}
      <p className="mt-4 text-base text-marron-doux">Les points de cette commande seront ajoutés après le paiement.</p>
      <button
        type="button"
        onClick={valider}
        className="mt-6 flex h-[76px] w-full items-center justify-center rounded-full bg-marron text-xl font-semibold text-papier active:bg-marron-fonce"
      >
        Continuer ma commande
      </button>
    </>
  );
}
