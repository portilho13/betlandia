"use client";

import { OddsButton } from "@/components/match/OddsButton";
import type { Market, MarketOdds, Fixture } from "@/types";

interface Props {
  market: Market;
  odds: MarketOdds | null;
  fixture: Fixture;
}

const MARKET_LABELS: Record<string, string> = {
  MATCH_WINNER: "Resultado (Tempo Regulamentar)",
  BTTS: "Ambas as Equipas Marcam",
  OVER_UNDER: "Total de Golos (Acima/Abaixo de 2.5)",
};

export function MarketSection({ market, odds, fixture }: Props) {
  const label = MARKET_LABELS[market.type] || market.type;
  const suspended = market.status !== "OPEN";

  return (
    <div className="border border-brand-gray-border rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-brand-gray border-b border-brand-gray-border">
        <p className="text-sm font-semibold text-brand-dark">{label}</p>
        {suspended && (
          <span className="text-xs text-orange-500 font-medium">Suspensa</span>
        )}
      </div>

      <div className="p-3">
        {odds ? (
          <div className="flex gap-2">
            {market.type === "MATCH_WINNER" && (
              <>
                <OddsButton
                  label={fixture.homeTeam}
                  odds={odds.homeOdd}
                  selection="HOME"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
                <OddsButton
                  label="Empate"
                  odds={odds.drawOdd}
                  selection="DRAW"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
                <OddsButton
                  label={fixture.awayTeam}
                  odds={odds.awayOdd}
                  selection="AWAY"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
              </>
            )}
            {market.type === "BTTS" && (
              <>
                <OddsButton
                  label="Sim"
                  odds={odds.homeOdd}
                  selection="HOME"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
                <OddsButton
                  label="Não"
                  odds={odds.awayOdd}
                  selection="AWAY"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
              </>
            )}
            {market.type === "OVER_UNDER" && (
              <>
                <OddsButton
                  label="Acima 2.5"
                  odds={odds.homeOdd}
                  selection="HOME"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
                <OddsButton
                  label="Abaixo 2.5"
                  odds={odds.awayOdd}
                  selection="AWAY"
                  marketId={market.id}
                  marketType={market.type}
                  fixtureId={fixture.matchId}
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  disabled={suspended}
                />
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-brand-gray-text">Odds em cálculo…</p>
        )}
      </div>
    </div>
  );
}
