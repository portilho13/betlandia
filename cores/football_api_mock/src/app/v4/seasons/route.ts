import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  return NextResponse.json({ seasons: db.seasons.all() })
}

export async function POST(request: Request) {
  const body = await request.json()
  const season = db.seasons.create({
    startDate: body.startDate,
    endDate: body.endDate,
    currentMatchday: body.currentMatchday ?? 1,
    winner: body.winner ?? null,
    competitionId: body.competitionId,
  })
  return NextResponse.json(season, { status: 201 })
}
