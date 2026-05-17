import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const team = db.teams.find(Number(id))
  if (!team) return NextResponse.json({ message: 'Team not found' }, { status: 404 })

  const area = db.areas.find(team.areaId)
  const squad = db.players.findByTeam(team.id)

  return NextResponse.json({
    ...team,
    area: area ? { id: area.id, name: area.name, code: area.code, flag: area.flag } : null,
    squad: squad.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      dateOfBirth: p.dateOfBirth,
      nationality: p.nationality,
    })),
    lastUpdated: new Date().toISOString(),
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const team = db.teams.update(Number(id), body)
  if (!team) return NextResponse.json({ message: 'Team not found' }, { status: 404 })
  return NextResponse.json(team)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = db.teams.delete(Number(id))
  if (!ok) return NextResponse.json({ message: 'Team not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
