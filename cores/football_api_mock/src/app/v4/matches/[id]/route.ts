import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto } from '@/lib/response'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })
  return NextResponse.json({ match: buildMatchDto(match) })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = db.matches.find(Number(id))
  if (!match) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  const body = await request.json()
  const updated = db.matches.update(Number(id), body)
  if (!updated) return NextResponse.json({ message: 'Match not found' }, { status: 404 })

  return NextResponse.json({ match: buildMatchDto(updated) })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = db.matches.delete(Number(id))
  if (!ok) return NextResponse.json({ message: 'Match not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
