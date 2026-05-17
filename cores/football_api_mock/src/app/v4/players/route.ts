import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const players = db.players.all()
  return NextResponse.json({ count: players.length, players })
}

export async function POST(request: Request) {
  const body = await request.json()
  const player = db.players.create({
    name: body.name,
    firstName: body.firstName ?? '',
    lastName: body.lastName ?? '',
    dateOfBirth: body.dateOfBirth ?? '1990-01-01',
    countryOfBirth: body.countryOfBirth ?? '',
    nationality: body.nationality ?? '',
    position: body.position ?? 'Forward',
    teamId: body.teamId,
    lastUpdated: new Date().toISOString(),
  })
  return NextResponse.json(player, { status: 201 })
}
