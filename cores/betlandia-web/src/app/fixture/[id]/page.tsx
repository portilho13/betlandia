"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MarketSection } from "@/components/market/MarketSection";
import { useOddsSocket } from "@/hooks/useOddsSocket";
import type { Fixture, MarketOdds, Market, OddsUpdate } from "@/types";

function teamGradient(team: string) {
  const colors = [
    "from-red-700 to-red-900", "from-blue-700 to-blue-900",
    "from-green-700 to-green-900", "from-yellow-600 to-yellow-800",
    "from-purple-700 to-purple-900", "from-orange-600 to-orange-800",
  ];
  let h = 0;
  for (const c of team) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

export default function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matchId = parseInt(id, 10);

  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [oddsMap, setOddsMap] = useState<Record<string, MarketOdds>>({});
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.fixtures.get(matchId),
      api.odds.get(matchId),
      api.markets.get(matchId),
    ]).then(([f, o, m]) => {
      setFixture(f);
      const map: Record<string, MarketOdds> = {};
      o.forEach((odds) => { map[odds.marketType] = odds; });
      setOddsMap(map);
      setMarkets(m);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [matchId]);

  useOddsSocket(matchId, (update: OddsUpdate) => {
    setOddsMap((prev) => ({
      ...prev,
      [update.marketType]: {
        ...(prev[update.marketType] ?? {}),
        homeOdd: update.homeOdd,
        drawOdd: update.drawOdd,
        awayOdd: update.awayOdd,
        updatedAt: update.updatedAt,
      } as MarketOdds,
    }));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-gray-text">
        A carregar…
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-brand-gray-text">Jogo não encontrado</p>
        <Link href="/" className="text-brand-red underline text-sm">Voltar</Link>
      </div>
    );
  }

  const isLive = fixture.status === "IN_PLAY" || fixture.status === "LIVE";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-5 py-2 text-xs text-brand-gray-text border-b border-brand-gray-border">
        <Link href="/" className="hover:text-brand-red">Início</Link>
        <span className="mx-1">›</span>
        <span>Futebol</span>
        <span className="mx-1">›</span>
        <span className="text-brand-dark font-medium">{fixture.homeTeam} vs {fixture.awayTeam}</span>
      </div>

      {/* Match header */}
      <div className={`relative bg-gradient-to-br ${teamGradient(fixture.homeTeam)} text-white py-8 px-6`}>
        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AO VIVO
          </div>
        )}

        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black mx-auto mb-2">
              {fixture.homeTeam.charAt(0)}
            </div>
            <p className="font-bold text-sm">{fixture.homeTeam}</p>
          </div>

          <div className="text-center">
            {isLive && fixture.homeScore !== null ? (
              <p className="text-4xl font-black">{fixture.homeScore} — {fixture.awayScore}</p>
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {new Date(fixture.gameDate).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(fixture.gameDate).toLocaleDateString("pt-PT")}
                </p>
              </>
            )}
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black mx-auto mb-2">
              {fixture.awayTeam.charAt(0)}
            </div>
            <p className="font-bold text-sm">{fixture.awayTeam}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-brand-gray-border overflow-x-auto">
        {["Top", "Resultado", "Marcadores", "Golos", "Estatísticas"].map((tab, i) => (
          <button
            key={tab}
            className={`px-3 py-1.5 text-sm rounded whitespace-nowrap font-medium transition-colors
              ${i === 0 ? "bg-brand-red text-white" : "text-brand-gray-text hover:text-brand-dark"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Markets */}
      <div className="p-5">
        {markets.length === 0 ? (
          <p className="text-sm text-brand-gray-text text-center py-10">
            Mercados ainda não disponíveis
          </p>
        ) : (
          markets.map((market) => (
            <MarketSection
              key={market.id}
              market={market}
              odds={oddsMap[market.type] ?? null}
              fixture={fixture}
            />
          ))
        )}
      </div>
    </div>
  );
}
