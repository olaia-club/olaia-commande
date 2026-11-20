import type { Metadata, Viewport } from "next";

import { Inactivite } from "@/components/borne/inactivite";
import { PanierProvider } from "@/components/borne/panier-context";

export const metadata: Metadata = {
  title: "Olaía · Borne",
  appleWebApp: { capable: true, title: "Olaía", statusBarStyle: "black-translucent" },
};

// Sur l'iPad : pas de zoom au double-tap, plein écran une fois ajouté à l'écran d'accueil.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F4EEE7",
};

export default function BorneLayout({ children }: LayoutProps<"/borne">) {
  return (
    <PanierProvider>
      <div className="borne fixed inset-0 flex flex-col overflow-hidden">{children}</div>
      <Inactivite />
    </PanierProvider>
  );
}
