import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto } from '@/lib/response'
import type { Goal } from '@/types/football'

function countGoals(goals: Goal[], homeTeamId: number) {
  let home = 0
  let away = 0
  for (const g of goals) {
    const isOwnGoal = g.type === 'OWN'
    const scoredByHome = g.team.id === homeTeamId
    if ((!isOwnGoal && scoredByHome) || (isOwnGoal && !scoredByHome)) home++
    else away++
  }
  return { home, away }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  const body = await request.json()

  const existingGoals = match.goals ?? []

  // compute running score before this goal
  const before = countGoals(existingGoals, match.homeTeamId)

  const isOwnGoal = (body.type ?? 'REGULAR') === 'OWN'
  const scoredByHome = body.team.id === match.homeTeamId
  const homeScores = (!isOwnGoal && scoredByHome) || (isOwnGoal && !scoredByHome)

  const runningScore = {
    home: homeScores ? before.home + 1 : before.home,
    away: homeScores ? before.away : before.away + 1,
  }

  const goal: Goal = {
    minute: body.minute ?? match.minute ?? 1,
    injuryTime: body.injuryTime ?? null,
    type: body.type ?? 'REGULAR',
    team: body.team,
    scorer: body.scorer ?? null,
    assist: body.assist ?? null,
    score: runningScore,
  }

  const goals = [...existingGoals, goal]
  const { home: homeGoals, away: awayGoals } = countGoals(goals, match.homeTeamId)
  const winner = homeGoals > awayGoals ? 'HOME_TEAM' : awayGoals > homeGoals ? 'AWAY_TEAM' : 'DRAW'

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

  const { home: homeGoals, away: awayGoals } = countGoals(goals, match.homeTeamId)

  const updated = db.matches.update(Number(id), {
    goals,
    score: {
      ...match.score,
      fullTime: { home: homeGoals, away: awayGoals },
    },
  })

  return NextResponse.json({ match: buildMatchDto(updated!) })
}
