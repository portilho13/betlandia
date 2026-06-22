import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto } from '@/lib/response'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = db.players.find(Number(id))
  if (!player) return NextResponse.json({ message: 'Player not found' }, { status: 404 })

  const matches = db.matches
    .all()
    .filter((m) => m.goals?.some((g) => g.scorer?.id === player.id))

  return NextResponse.json({ count: matches.length, matches: matches.map(buildMatchDto) })
}
