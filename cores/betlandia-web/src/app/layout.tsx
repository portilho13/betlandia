import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BetSlip } from "@/components/layout/BetSlip";

export const metadata: Metadata = {
  title: "Betlandia",
  description: "Apostas desportivas em tempo real",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <div className="flex flex-col h-screen overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white">
              {children}
            </main>
            <BetSlip />
          </div>
        </div>
      </body>
    </html>
  );
}
