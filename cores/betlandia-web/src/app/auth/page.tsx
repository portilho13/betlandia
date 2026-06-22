"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const { login, register, loading, error, isLoggedIn } = useAuth();
  const router = useRouter();

  if (isLoggedIn) {
    router.push("/");
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      await login(username);
    } else {
      await register(username, email);
    }
    if (!error) router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
      <div className="w-full max-w-sm bg-white rounded-xl border border-brand-gray-border p-8 shadow-sm">
        <div className="flex mb-6 rounded-lg overflow-hidden border border-brand-gray-border">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors
                ${mode === m ? "bg-brand-red text-white" : "text-brand-gray-text hover:bg-brand-gray"}`}
            >
              {m === "login" ? "Entrar" : "Registar"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-gray-text mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="o_teu_username"
              className="w-full border border-brand-gray-border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-brand-gray-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@exemplo.com"
                className="w-full border border-brand-gray-border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-red/30"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-bold rounded disabled:opacity-50"
          >
            {loading ? "A processar…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
