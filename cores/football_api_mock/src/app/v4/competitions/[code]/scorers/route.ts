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
  const limit = Number(searchParams.get('limit') ?? 10)

  const matches = db.matches.findByCompetition(competition.id)

  type ScorerEntry = { playerId: number | null; playerName: string; teamId: number; goals: number }
  const scorerMap = new Map<string, ScorerEntry>()

  matches.forEach((m) => {
    ;(m.goals ?? []).forEach((g) => {
      if (g.type === 'OWN') return
      const key = g.scorer ? String(g.scorer.id) : `anon-${g.team.id}`
      const entry = scorerMap.get(key) ?? {
        playerId: g.scorer?.id ?? null,
        playerName: g.scorer?.name ?? 'Unknown',
        teamId: g.team.id,
        goals: 0,
      }
      entry.goals++
      scorerMap.set(key, entry)
    })
  })

  const scorers = [...scorerMap.values()]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit)
    .map(({ playerId, playerName, teamId, goals }) => {
      const team = db.teams.find(teamId)
      const player = playerId ? db.players.find(playerId) : null
      return {
        player: {
          id: playerId,
          name: playerName,
          firstName: player?.firstName ?? null,
          lastName: player?.lastName ?? null,
          nationality: player?.nationality ?? null,
        },
        team: team ? { id: team.id, name: team.name, tla: team.tla, crest: team.crest } : null,
        playedMatches: null,
        goals,
        assists: null,
        penalties: null,
      }
    })

  return NextResponse.json({
    count: scorers.length,
    filters: { limit },
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
    },
    scorers,
  })
}
