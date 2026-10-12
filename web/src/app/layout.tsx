import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA Vault | Composable Credit & High-Velocity Yield on Monad",
  description: "Autonomous Liquidity Vault & Continuous Isolated Credit Accounts on Monad Cancun Testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d0e12] text-white font-sans antialiased selection:bg-[#E1007E]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
