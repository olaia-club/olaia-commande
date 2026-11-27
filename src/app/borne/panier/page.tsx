import { PanierBorne } from "@/components/borne/panier-borne";
import { clubConfigure } from "@/lib/fimio/club";

export default function PagePanier() {
  return <PanierBorne clubConfigure={clubConfigure()} />;
}
