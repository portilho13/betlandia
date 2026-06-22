import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const areas = db.areas.all()
  return NextResponse.json({ count: areas.length, filters: {}, areas })
}

export async function POST(request: Request) {
  const body = await request.json()
  const area = db.areas.create({
    name: body.name,
    code: body.code ?? null,
    flag: body.flag ?? null,
    parentAreaId: body.parentAreaId ?? null,
    parentArea: body.parentArea ?? null,
  })
  return NextResponse.json(area, { status: 201 })
}
