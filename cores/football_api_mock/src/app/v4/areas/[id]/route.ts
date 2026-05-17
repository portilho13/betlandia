import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const area = db.areas.find(Number(id))
  if (!area) return NextResponse.json({ message: 'Area not found' }, { status: 404 })
  return NextResponse.json(area)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const area = db.areas.update(Number(id), body)
  if (!area) return NextResponse.json({ message: 'Area not found' }, { status: 404 })
  return NextResponse.json(area)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = db.areas.delete(Number(id))
  if (!ok) return NextResponse.json({ message: 'Area not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
