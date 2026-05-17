import { db } from '@/lib/db'
import MatchesClient from './MatchesClient'

export const dynamic = 'force-dynamic'

export default function MatchesPage() {
  const matches = db.matches.all()
  const teams = db.teams.all()
  const competitions = db.competitions.all()

  const enriched = matches.map((m) => ({
    ...m,
    homeTeam: teams.find((t) => t.id === m.homeTeamId) ?? null,
    awayTeam: teams.find((t) => t.id === m.awayTeamId) ?? null,
    competition: competitions.find((c) => c.id === m.competitionId) ?? null,
  }))

  return <MatchesClient matches={enriched} teams={teams} competitions={competitions} />
}
