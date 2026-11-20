import type { Metadata, Viewport } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// Charte Olaía v5 : Newsreader pour les titres et la voix, DM Sans pour l'interface.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Olaía · Commande",
  description: "Borne de commande et back-office du coffee shop Olaía, reliés à la caisse Zelty.",
};

export const viewport: Viewport = {
  themeColor: "#F4EEE7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-creme font-sans text-marron">{children}</body>
    </html>
  );
}
