import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const { searchParams } = request.nextUrl
  const season = searchParams.get('season')

  const allSeasons = db.seasons.findByCompetition(competition.id)
  const currentSeason = competition.currentSeasonId
    ? db.seasons.find(competition.currentSeasonId)
    : allSeasons[0]

  const matches = db.matches.findByCompetition(competition.id)
  const teamIds = [...new Set([...matches.map((m) => m.homeTeamId), ...matches.map((m) => m.awayTeamId)])]
  const teams = teamIds.map((id) => db.teams.find(id)).filter(Boolean)

  return NextResponse.json({
    count: teams.length,
    filters: { season: season ?? null },
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
    },
    season: currentSeason
      ? {
          id: currentSeason.id,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          currentMatchday: currentSeason.currentMatchday,
          winner: currentSeason.winner,
        }
      : null,
    teams: teams.map((t) => ({
      id: t!.id,
      name: t!.name,
      shortName: t!.shortName,
      tla: t!.tla,
      crest: t!.crest,
      address: t!.address,
      website: t!.website,
      founded: t!.founded,
      clubColors: t!.clubColors,
      venue: t!.venue,
    })),
  })
}
