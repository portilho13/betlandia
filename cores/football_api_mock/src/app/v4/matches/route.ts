import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMatchDto, buildResultSet, defaultScore } from '@/lib/response'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const competitionCode = searchParams.get('competitions') ?? undefined
  const matchday = searchParams.get('matchday') ? Number(searchParams.get('matchday')) : undefined

  const matches = db.matches.query({ competitionCode, dateFrom, dateTo, status, matchday })

  return NextResponse.json({
    filters: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null, status: status ?? null },
    resultSet: buildResultSet(matches, dateFrom, dateTo),
    matches: matches.map(buildMatchDto),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const competition = db.competitions.find(body.competitionId)
  if (!competition) {
    return NextResponse.json({ message: 'Competition not found' }, { status: 404 })
  }

  const season = competition.currentSeasonId
    ? db.seasons.find(competition.currentSeasonId)
    : db.seasons.findByCompetition(competition.id)[0]

  const match = db.matches.create({
    competitionId: competition.id,
    seasonId: season?.id ?? 1,
    areaId: competition.areaId,
    utcDate: body.utcDate,
    status: body.status ?? 'SCHEDULED',
    minute: null,
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
    bookings: [],
    substitutions: [],
    referees: [],
  })

  return NextResponse.json(buildMatchDto(match), { status: 201 })
}
