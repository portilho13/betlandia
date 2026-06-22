import { MatchCard } from "@/components/match/MatchCard";
import { MatchRow } from "@/components/match/MatchRow";
import type { Fixture, MarketOdds, Market } from "@/types";

async function fetchData(path: string) {
  try {
    const base = process.env.API_GATEWAY_URL || "http://localhost:8080";
    const res = await fetch(`${base}${path}`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getFixtureData(fixture: Fixture) {
  const [oddsArr, markets]: [MarketOdds[] | null, Market[] | null] = await Promise.all([
    fetchData(`/odds/${fixture.matchId}`),
    fetchData(`/markets/${fixture.matchId}`),
  ]);

  const odds = oddsArr?.find((o) => o.marketType === "MATCH_WINNER") ?? null;
  const market = markets?.find((m) => m.type === "MATCH_WINNER") ?? null;
  return { odds, market };
}

export default async function HomePage() {
  const fixtures: Fixture[] | null = await fetchData("/fixtures");
  const sorted = (fixtures ?? []).sort((a, b) => {
    const priority = (f: Fixture) =>
      f.status === "IN_PLAY" || f.status === "LIVE" ? 0 :
      f.status === "SCHEDULED" ? 1 : 2;
    return priority(a) - priority(b) || new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime();
  });

  const featured = sorted.slice(0, 4);
  const rest = sorted.slice(4);

  const featuredData = await Promise.all(featured.map(getFixtureData));
  const restData = await Promise.all(rest.map(getFixtureData));

  return (
    <div>
      {/* Promo banner */}
      <div className="bg-brand-red text-white text-center py-3 px-4">
        <p className="font-bold text-base">Recebe 50€ em Freebets</p>
        <p className="text-sm opacity-80">Completa os desafios de boas-vindas</p>
      </div>

      <div className="p-5">
        {/* Tab bar */}
        <div className="flex gap-6 border-b border-brand-gray-border mb-5">
          <button className="pb-2 text-sm font-bold text-brand-red border-b-2 border-brand-red">
            Destaques
          </button>
          <button className="pb-2 text-sm text-brand-gray-text hover:text-brand-dark">
            Agora
          </button>
        </div>

        {fixtures === null ? (
          <div className="text-center py-20 text-brand-gray-text">
            <p className="text-lg mb-2">Sem ligação ao servidor</p>
            <p className="text-sm">Verifica se o docker-compose está em execução.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-brand-gray-text">
            <p className="text-lg mb-2">Sem jogos disponíveis</p>
            <p className="text-sm">Os jogos aparecem aqui quando o match_ingestor os detectar.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {featured.map((fixture, i) => (
                    <MatchCard
                      key={fixture.id}
                      fixture={fixture}
                      odds={featuredData[i].odds}
                      market={featuredData[i].market}
                    />
                  ))}
                </div>
              </>
            )}

            {rest.length > 0 && (
              <div className="border border-brand-gray-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-brand-gray border-b border-brand-gray-border">
                  <p className="text-xs font-bold text-brand-gray-text uppercase tracking-wide">
                    Todos os jogos
                  </p>
                </div>
                {rest.map((fixture, i) => (
                  <MatchRow
                    key={fixture.id}
                    fixture={fixture}
                    odds={restData[i].odds}
                    market={restData[i].market}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
