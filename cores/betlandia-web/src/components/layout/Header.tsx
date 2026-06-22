"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { isLoggedIn, username, balance, logout } = useAuth();

  return (
    <header className="bg-brand-red text-white h-12 flex items-center px-6 justify-between shrink-0 z-10">
      <Link href="/" className="font-black text-xl tracking-tight">
        Betlandia
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {isLoggedIn ? (
          <>
            {balance !== null && (
              <span className="bg-white/20 px-2.5 py-0.5 rounded font-bold">
                {balance.toFixed(2)} €
              </span>
            )}
            <Link href="/bets" className="opacity-80 hover:opacity-100 hover:underline">
              As minhas apostas
            </Link>
            <span className="opacity-80">Olá, <strong>{username}</strong></span>
            <button onClick={logout} className="underline opacity-70 hover:opacity-100">
              Sair
            </button>
          </>
        ) : (
          <>
            <Link href="/auth" className="hover:underline opacity-80">Entrar</Link>
            <Link
              href="/auth"
              className="bg-white text-brand-red font-bold px-3 py-1 rounded hover:bg-gray-100"
            >
              Registar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
