import Link from "next/link";
import { OddsButton } from "./OddsButton";
import type { Fixture, MarketOdds } from "@/types";

const TEAM_COLORS: Record<string, string> = {
  default: "from-slate-700 to-slate-900",
};

function teamGradient(team: string) {
  const colors = [
    "from-red-700 to-red-900",
    "from-blue-700 to-blue-900",
    "from-green-700 to-green-900",
    "from-yellow-600 to-yellow-800",
    "from-purple-700 to-purple-900",
    "from-orange-600 to-orange-800",
  ];
  let hash = 0;
  for (const c of team) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

interface Props {
  fixture: Fixture;
  odds: MarketOdds | null;
  market: { id: string } | null;
}

export function MatchCard({ fixture, odds, market }: Props) {
  const isLive = fixture.status === "IN_PLAY" || fixture.status === "LIVE";

  return (
    <Link href={`/fixture/${fixture.matchId}`} className="block">
      <div className="rounded-xl overflow-hidden shadow-sm border border-brand-gray-border bg-white hover:shadow-md transition-shadow">
        <div className={`relative h-36 bg-gradient-to-br ${teamGradient(fixture.homeTeam)} flex items-center justify-between px-6`}>
          {isLive && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AO VIVO
            </span>
          )}
          <div className="text-center text-white">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black mb-1">
              {fixture.homeTeam.charAt(0)}
            </div>
            <p className="text-sm font-semibold leading-tight max-w-[80px] truncate">{fixture.homeTeam}</p>
          </div>

          <div className="text-center text-white">
            {isLive && fixture.homeScore !== null ? (
              <p className="text-3xl font-black">{fixture.homeScore} - {fixture.awayScore}</p>
            ) : (
              <p className="text-lg font-bold opacity-80">
                {new Date(fixture.gameDate).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            <p className="text-xs opacity-60 mt-1">Amigáveis</p>
          </div>

          <div className="text-center text-white">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black mb-1">
              {fixture.awayTeam.charAt(0)}
            </div>
            <p className="text-sm font-semibold leading-tight max-w-[80px] truncate">{fixture.awayTeam}</p>
          </div>
        </div>

        {odds && market ? (
          <div className="flex gap-2 p-3">
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
          <div className="p-3 text-center text-xs text-brand-gray-text">Odds em cálculo…</div>
        )}
      </div>
    </Link>
  );
}
