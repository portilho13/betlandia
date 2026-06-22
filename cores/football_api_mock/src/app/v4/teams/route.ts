import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const teams = db.teams.all()
  return NextResponse.json({ count: teams.length, filters: {}, teams })
}

export async function POST(request: Request) {
  const body = await request.json()
  const team = db.teams.create({
    name: body.name,
    shortName: body.shortName ?? body.name,
    tla: body.tla ?? body.name.slice(0, 3).toUpperCase(),
    crest: body.crest ?? null,
    areaId: body.areaId ?? 1,
    address: body.address ?? null,
    website: body.website ?? null,
    founded: body.founded ?? null,
    clubColors: body.clubColors ?? null,
    venue: body.venue ?? null,
  })
  return NextResponse.json(team, { status: 201 })
}
