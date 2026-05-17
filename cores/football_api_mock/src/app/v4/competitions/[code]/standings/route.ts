import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const currentSeason = competition.currentSeasonId
    ? db.seasons.find(competition.currentSeasonId)
    : db.seasons.findByCompetition(competition.id)[0]

  const matches = db.matches
    .findByCompetition(competition.id)
    .filter((m) => m.status === 'FINISHED')

  const teamIds = [
    ...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)]),
  ]

  type TableRow = {
    position: number
    team: { id: number; name: string; shortName: string; tla: string; crest: string | null }
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
  }

  const table: TableRow[] = teamIds.map((teamId) => {
    const team = db.teams.find(teamId)
    const homeMatches = matches.filter((m) => m.homeTeamId === teamId)
    const awayMatches = matches.filter((m) => m.awayTeamId === teamId)

    let won = 0, draw = 0, lost = 0, goalsFor = 0, goalsAgainst = 0

    homeMatches.forEach((m) => {
      const h = m.score.fullTime.home ?? 0
      const a = m.score.fullTime.away ?? 0
      goalsFor += h
      goalsAgainst += a
      if (h > a) won++
      else if (h === a) draw++
      else lost++
    })

    awayMatches.forEach((m) => {
      const h = m.score.fullTime.home ?? 0
      const a = m.score.fullTime.away ?? 0
      goalsFor += a
      goalsAgainst += h
      if (a > h) won++
      else if (a === h) draw++
      else lost++
    })

    return {
      position: 0,
      team: {
        id: team?.id ?? teamId,
        name: team?.name ?? 'Unknown',
        shortName: team?.shortName ?? 'Unknown',
        tla: team?.tla ?? 'UNK',
        crest: team?.crest ?? null,
      },
      playedGames: homeMatches.length + awayMatches.length,
      won,
      draw,
      lost,
      points: won * 3 + draw,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
    }
  })

  table.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
  table.forEach((row, i) => { row.position = i + 1 })

  return NextResponse.json({
    filters: {},
    season: currentSeason
      ? {
          id: currentSeason.id,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          currentMatchday: currentSeason.currentMatchday,
          winner: currentSeason.winner,
        }
      : null,
    standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', group: null, table }],
  })
}
