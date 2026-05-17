import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const competitions = db.competitions.all()
  const areas = db.areas.all()
  const seasons = db.seasons.all()

  const result = competitions.map((c) => {
    const area = areas.find((a) => a.id === c.areaId)
    const currentSeason = seasons.find((s) => s.id === c.currentSeasonId)
    const allSeasons = seasons.filter((s) => s.competitionId === c.id)
    return {
      id: c.id,
      area: area ? { id: area.id, name: area.name, code: area.code, flag: area.flag } : null,
      name: c.name,
      code: c.code,
      type: c.type,
      emblem: c.emblem,
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
    }
  })

  return NextResponse.json({ count: result.length, filters: {}, competitions: result })
}

export async function POST(request: Request) {
  const body = await request.json()
  const competition = db.competitions.create({
    name: body.name,
    code: body.code,
    type: body.type ?? 'LEAGUE',
    emblem: body.emblem ?? null,
    areaId: body.areaId ?? 1,
    currentSeasonId: body.currentSeasonId ?? null,
  })
  return NextResponse.json(competition, { status: 201 })
}
