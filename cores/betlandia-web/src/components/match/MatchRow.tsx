import Link from "next/link";
import { OddsButton } from "./OddsButton";
import type { Fixture, MarketOdds } from "@/types";

interface Props {
  fixture: Fixture;
  odds: MarketOdds | null;
  market: { id: string } | null;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Fixture["status"] }) {
  if (status === "IN_PLAY" || status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        AO VIVO
      </span>
    );
  }
  return null;
}

export function MatchRow({ fixture, odds, market }: Props) {
  return (
    <Link href={`/fixture/${fixture.matchId}`} className="block">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-brand-gray-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={fixture.status} />
            {fixture.status === "SCHEDULED" && (
              <span className="text-xs text-brand-gray-text">{formatTime(fixture.gameDate)}</span>
            )}
            {(fixture.status === "IN_PLAY" || fixture.status === "LIVE") && fixture.homeScore !== null && (
              <span className="text-xs font-bold text-brand-red">
                {fixture.homeScore} - {fixture.awayScore}
              </span>
            )}
          </div>
          <div className="font-medium text-sm text-brand-dark truncate">
            {fixture.homeTeam} <span className="text-brand-gray-text font-normal">vs</span> {fixture.awayTeam}
          </div>
        </div>

        {odds && market ? (
          <div className="flex gap-2 ml-4 shrink-0">
            <OddsButton
              label={fixture.homeTeam.split(" ")[0]}
              odds={odds.homeOdd}
              selection="HOME"
              marketId={market.id}
              marketType="MATCH_WINNER"
              fixtureId={fixture.matchId}
              homeTeam={fixture.homeTeam}
              awayTeam={fixture.awayTeam}
            />
            <OddsButton
              label="Empate"
              odds={odds.drawOdd}
              selection="DRAW"
              marketId={market.id}
              marketType="MATCH_WINNER"
              fixtureId={fixture.matchId}
              homeTeam={fixture.homeTeam}
              awayTeam={fixture.awayTeam}
            />
            <OddsButton
              label={fixture.awayTeam.split(" ")[0]}
              odds={odds.awayOdd}
              selection="AWAY"
              marketId={market.id}
              marketType="MATCH_WINNER"
              fixtureId={fixture.matchId}
              homeTeam={fixture.homeTeam}
              awayTeam={fixture.awayTeam}
            />
          </div>
        ) : (
          <span className="text-xs text-brand-gray-text ml-4">Odds indisponíveis</span>
        )}
      </div>
    </Link>
  );
}
