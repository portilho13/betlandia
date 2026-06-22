import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto } from '@/lib/response'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  const h2h = db.matches
    .all()
    .filter(
      (m) =>
        m.id !== match.id &&
        m.status === 'FINISHED' &&
        ((m.homeTeamId === match.homeTeamId && m.awayTeamId === match.awayTeamId) ||
          (m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId)),
    )
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, 10)

  return NextResponse.json({
    head2head: {
      numberOfMatches: h2h.length,
      totalGoals: h2h.reduce(
        (s, m) => s + (m.score.fullTime.home ?? 0) + (m.score.fullTime.away ?? 0),
        0,
      ),
    },
    matches: h2h.map(buildMatchDto),
  })
}
