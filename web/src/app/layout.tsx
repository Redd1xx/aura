import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA Vault | Monad Track 01",
  description: "Autonomous Liquidity Vault & High-Velocity Credit Engine on Monad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05080f] text-[#e6edf8] font-sans antialiased aura-terminal-grid selection:bg-[#00F0FF]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
