"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Bet, Fixture, Market } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  VOID: "bg-gray-100 text-gray-500",
};

const SELECTION_LABEL: Record<string, string> = {
  HOME: "Casa",
  DRAW: "Empate",
  AWAY: "Fora",
};

type EnrichedBet = Bet & {
  fixture?: Fixture;
  market?: Market;
};

export default function BetsPage() {
  const { isLoggedIn, userId, username } = useAuth();
  const [bets, setBets] = useState<EnrichedBet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [rawBets, fixtures] = await Promise.all([
          api.bets.forUser(userId!),
          api.fixtures.list(),
        ]);

        const fixturesByMatchId = new Map<number, Fixture>();
        fixtures.forEach((f) => fixturesByMatchId.set(f.matchId, f));

        const marketsByFixture = new Map<number, Market[]>();
        await Promise.all(
          [...new Set(fixtures.map((f) => f.matchId))].map(async (matchId) => {
            try {
              const markets = await api.markets.get(matchId);
              marketsByFixture.set(matchId, markets);
            } catch {}
          })
        );

        const marketsById = new Map<string, Market>();
        marketsByFixture.forEach((markets) =>
          markets.forEach((m) => marketsById.set(m.id, m))
        );

        const enriched: EnrichedBet[] = rawBets.map((bet) => {
          const market = marketsById.get(bet.marketId);
          const fixture = market
            ? fixturesByMatchId.get(market.fixtureId)
            : undefined;
          return { ...bet, fixture, market };
        });

        setBets(enriched);
      } catch {}
      setLoading(false);
    }

    load();
  }, [userId]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-brand-gray-text">Tens de entrar para ver as tuas apostas</p>
        <Link href="/auth" className="text-brand-red font-semibold underline text-sm">
          Entrar
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-gray-text">
        A carregar…
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-brand-dark mb-1">As minhas apostas</h1>
      <p className="text-sm text-brand-gray-text mb-5">{username}</p>

      {bets.length === 0 ? (
        <div className="text-center py-16 text-brand-gray-text">
          <p className="text-lg mb-2">Sem apostas ainda</p>
          <p className="text-sm">
            Vai à <Link href="/" className="text-brand-red underline">página inicial</Link> e faz a tua primeira aposta!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map((bet) => (
            <Link
              key={bet.id}
              href={bet.fixture ? `/fixture/${bet.fixture.matchId}` : "#"}
              className="block border border-brand-gray-border rounded-lg p-4 hover:border-brand-red/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLE[bet.status] ?? STATUS_STYLE.VOID}`}
                    >
                      {bet.status}
                    </span>
                    <span className="text-xs text-brand-gray-text">
                      {new Date(bet.placedAt).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {bet.fixture && (
                    <p className="text-sm font-bold text-brand-dark mb-0.5">
                      {bet.fixture.homeTeam} vs {bet.fixture.awayTeam}
                    </p>
                  )}

                  <p className="text-sm text-brand-dark">
                    <span className="font-semibold">{SELECTION_LABEL[bet.selection] ?? bet.selection}</span>
                    {bet.market && (
                      <span className="text-brand-gray-text"> · {bet.market.type.replace(/_/g, " ")}</span>
                    )}
                  </p>
                  <p className="text-xs text-brand-gray-text mt-0.5">
                    Odd: {bet.oddsAtPlacement.toFixed(2)} · Aposta: {bet.stake.toFixed(2)} €
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-dark">
                    {bet.potentialPayout.toFixed(2)} €
                  </p>
                  <p className="text-xs text-brand-gray-text">Ganho potencial</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
