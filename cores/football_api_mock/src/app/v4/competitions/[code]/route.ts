import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const area = db.areas.find(competition.areaId)
  const currentSeason = competition.currentSeasonId
    ? db.seasons.find(competition.currentSeasonId)
    : null
  const allSeasons = db.seasons.findByCompetition(competition.id)

  return NextResponse.json({
    id: competition.id,
    area: area ? { id: area.id, name: area.name, code: area.code, flag: area.flag } : null,
    name: competition.name,
    code: competition.code,
    type: competition.type,
    emblem: competition.emblem,
    currentSeason: currentSeason
      ? {
          id: currentSeason.id,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          currentMatchday: currentSeason.currentMatchday,
          winner: currentSeason.winner,
        }
      : null,
    seasons: allSeasons.map((s) => ({
      id: s.id,
      startDate: s.startDate,
      endDate: s.endDate,
      currentMatchday: s.currentMatchday,
      winner: s.winner,
    })),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }
  const body = await request.json()
  const updated = db.competitions.update(competition.id, body)
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }
  db.competitions.delete(competition.id)
  return new NextResponse(null, { status: 204 })
}
