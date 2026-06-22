"use client";

import { useState } from "react";
import { useBetSlip } from "@/store/betSlipStore";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export function BetSlip() {
  const { items, stake, setStake, removeItem, clear } = useBetSlip();
  const { isLoggedIn, userId, username } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [placing, setPlacing] = useState(false);

  const stakeNum = parseFloat(stake) || 0;
  const totalOdds = items.reduce((acc, i) => acc * i.odds, 1);
  const payout = stakeNum * totalOdds;

  async function handleBet() {
    if (!isLoggedIn || !userId || items.length === 0 || stakeNum <= 0) return;
    setPlacing(true);
    setError(null);
    setSuccess(false);
    try {
      for (const item of items) {
        await api.bets.place({
          userId,
          marketId: item.marketId,
          selection: item.selection,
          stake: stakeNum / items.length,
          requestedOdds: item.odds,
        });
      }
      setSuccess(true);
      clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <aside className="w-72 shrink-0 border-l border-brand-gray-border bg-white h-full flex flex-col">
      <div className="p-4 border-b border-brand-gray-border">
        <p className="text-sm font-bold text-brand-dark">
          {items.length} {items.length === 1 ? "seleção" : "seleções"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
          <span className="text-5xl">✌️</span>
          <p className="font-bold text-brand-dark">Faz uma nova aposta</p>
          <p className="text-sm text-brand-gray-text">Estamos a torcer por ti!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
              Aposta(s) colocada(s) com sucesso!
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">{error}</div>
          )}

          {items.map((item) => (
            <div key={item.marketId} className="rounded-lg border border-brand-gray-border p-3 text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-brand-dark leading-tight">
                  {item.homeTeam} vs {item.awayTeam}
                </span>
                <button
                  onClick={() => removeItem(item.marketId)}
                  className="text-brand-gray-text hover:text-red-500 ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-brand-gray-text">{item.label} · {item.marketType.replace("_", " ")}</p>
              <p className="mt-1 font-bold text-brand-red">{item.odds.toFixed(2)}</p>
            </div>
          ))}

          <div className="mt-2">
            <label className="text-xs text-brand-gray-text font-medium block mb-1">Valor da aposta (€)</label>
            <input
              type="number"
              min="0.50"
              step="0.50"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="0.00"
              className="w-full border border-brand-gray-border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-red/30"
            />
          </div>
        </div>
      )}

      <div className="p-4 border-t border-brand-gray-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-gray-text">Ganhos possíveis</span>
          <span className="font-bold text-brand-dark">
            {payout > 0 ? `${payout.toFixed(2)} €` : "0,00 €"}
          </span>
        </div>

        {!isLoggedIn ? (
          <p className="text-xs text-center text-brand-gray-text">
            <a href="/auth" className="text-brand-red font-semibold underline">Entra</a> para apostar
          </p>
        ) : null}

        <button
          onClick={handleBet}
          disabled={items.length === 0 || stakeNum <= 0 || !isLoggedIn || placing}
          className="w-full py-3 rounded-lg font-bold text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {placing ? "A processar…" : "Apostar"}
        </button>
      </div>
    </aside>
  );
}
