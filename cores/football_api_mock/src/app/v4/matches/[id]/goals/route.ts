import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto } from '@/lib/response'
import type { Goal } from '@/types/football'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  const body = await request.json()

  const goal: Goal = {
    minute: body.minute ?? match.minute ?? 1,
    injuryTime: body.injuryTime ?? null,
    type: body.type ?? 'REGULAR',
    team: body.team,
    scorer: body.scorer ?? null,
    assist: body.assist ?? null,
  }

  const goals = [...(match.goals ?? []), goal]
  const isHome = goal.team.id === match.homeTeamId
  const isOwnGoal = goal.type === 'OWN'

  const homeGoals = goals.filter(
    (g) => (g.team.id === match.homeTeamId && g.type !== 'OWN') ||
            (g.team.id === match.awayTeamId && g.type === 'OWN'),
  ).length
  const awayGoals = goals.filter(
    (g) => (g.team.id === match.awayTeamId && g.type !== 'OWN') ||
            (g.team.id === match.homeTeamId && g.type === 'OWN'),
  ).length

  const winner =
    homeGoals > awayGoals ? 'HOME_TEAM' : awayGoals > homeGoals ? 'AWAY_TEAM' : 'DRAW'

  const updated = db.matches.update(Number(id), {
    goals,
    score: {
      ...match.score,
      fullTime: { home: homeGoals, away: awayGoals },
      winner: match.status === 'FINISHED' ? winner : null,
    },
  })

  return NextResponse.json({ match: buildMatchDto(updated!) })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  const goals = [...(match.goals ?? [])]
  if (goals.length === 0) {
    return NextResponse.json({ message: 'No goals to remove' }, { status: 400 })
  }
  goals.pop()

  const homeGoals = goals.filter(
    (g) => (g.team.id === match.homeTeamId && g.type !== 'OWN') ||
            (g.team.id === match.awayTeamId && g.type === 'OWN'),
  ).length
  const awayGoals = goals.filter(
    (g) => (g.team.id === match.awayTeamId && g.type !== 'OWN') ||
            (g.team.id === match.homeTeamId && g.type === 'OWN'),
  ).length

  const updated = db.matches.update(Number(id), {
    goals,
    score: {
      ...match.score,
      fullTime: { home: homeGoals, away: awayGoals },
    },
  })

  return NextResponse.json({ match: buildMatchDto(updated!) })
}
