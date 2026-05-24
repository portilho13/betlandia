import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto, buildResultSet, defaultScore } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const { searchParams } = request.nextUrl
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const matchday = searchParams.get('matchday')
    ? Number(searchParams.get('matchday'))
    : undefined

  const matches = db.matches.query({
    competitionCode: code,
    dateFrom,
    dateTo,
    status,
    matchday,
  })

  return NextResponse.json({
    filters: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null, status: status ?? null },
    resultSet: buildResultSet(matches, dateFrom, dateTo),
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
    },
    matches: matches.map(buildMatchDto),
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const competition = db.competitions.findByCode(code)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const body = await request.json()
  const season = competition.currentSeasonId
    ? db.seasons.find(competition.currentSeasonId)
    : db.seasons.findByCompetition(competition.id)[0]

  const match = db.matches.create({
    ...(body.id !== undefined ? { id: Number(body.id) } : {}),
    competitionId: competition.id,
    seasonId: season?.id ?? 1,
    areaId: competition.areaId,
    utcDate: body.utcDate,
    status: body.status ?? 'SCHEDULED',
    minute: null,
    injuryTime: null,
    attendance: null,
    venue: body.venue ?? null,
    matchday: body.matchday ?? 1,
    stage: body.stage ?? 'REGULAR_SEASON',
    group: body.group ?? null,
    lastUpdated: new Date().toISOString(),
    homeTeamId: body.homeTeamId,
    awayTeamId: body.awayTeamId,
    score: body.score ?? defaultScore(),
    goals: [],
    penalties: [],
    bookings: [],
    substitutions: [],
    odds: { homeWin: null, draw: null, awayWin: null },
    referees: [],
  })

  return NextResponse.json(buildMatchDto(match), { status: 201 })
}
