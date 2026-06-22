import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = db.players.find(Number(id))
  if (!player) return NextResponse.json({ message: 'Player not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const player = db.players.update(Number(id), body)
  if (!player) return NextResponse.json({ message: 'Player not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = db.players.delete(Number(id))
  if (!ok) return NextResponse.json({ message: 'Player not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
