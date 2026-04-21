import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Memphis 911 & Enforcement Equity Explorer",
  description:
    "Neighborhood-level view of 911 performance, EMS response, traffic enforcement, and public-safety incidents in Memphis, Tennessee. Public data only.",
  metadataBase: new URL("https://memphisequity.app"),
  openGraph: {
    title: "Memphis 911 & Enforcement Equity Explorer",
    description:
      "Public read-only dashboard of Memphis public-safety performance by council district.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
