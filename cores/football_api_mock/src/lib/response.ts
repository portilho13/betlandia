import { db } from './db'
import type { Match } from '@/types/football'

export function buildMatchDto(match: Match) {
  const competition = db.competitions.find(match.competitionId)
  const season = db.seasons.find(match.seasonId)
  const area = db.areas.find(match.areaId)
  const homeTeam = db.teams.find(match.homeTeamId)
  const awayTeam = db.teams.find(match.awayTeamId)

  return {
    area: area
      ? { id: area.id, name: area.name, code: area.code, flag: area.flag }
      : null,
    competition: competition
      ? {
          id: competition.id,
          name: competition.name,
          code: competition.code,
          type: competition.type,
          emblem: competition.emblem,
        }
      : null,
    season: season
      ? {
          id: season.id,
          startDate: season.startDate,
          endDate: season.endDate,
          currentMatchday: season.currentMatchday,
          winner: season.winner,
        }
      : null,
    id: match.id,
    utcDate: match.utcDate,
    status: match.status,
    minute: match.minute,
    attendance: match.attendance,
    venue: match.venue,
    matchday: match.matchday,
    stage: match.stage,
    group: match.group,
    lastUpdated: match.lastUpdated,
    homeTeam: homeTeam
      ? {
          id: homeTeam.id,
          name: homeTeam.name,
          shortName: homeTeam.shortName,
          tla: homeTeam.tla,
          crest: homeTeam.crest,
        }
      : null,
    awayTeam: awayTeam
      ? {
          id: awayTeam.id,
          name: awayTeam.name,
          shortName: awayTeam.shortName,
          tla: awayTeam.tla,
          crest: awayTeam.crest,
        }
      : null,
    score: match.score,
    goals: match.goals ?? [],
    bookings: match.bookings ?? [],
    substitutions: match.substitutions ?? [],
    referees: match.referees ?? [],
  }
}

export function buildResultSet(matches: Match[], dateFrom?: string, dateTo?: string) {
  const sorted = [...matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  return {
    count: matches.length,
    first: sorted[0]?.utcDate?.split('T')[0] ?? dateFrom ?? null,
    last: sorted[sorted.length - 1]?.utcDate?.split('T')[0] ?? dateTo ?? null,
    played: matches.filter((m) => m.status === 'FINISHED').length,
  }
}

export function defaultScore() {
  return {
    winner: null,
    duration: 'REGULAR',
    fullTime: { home: null, away: null },
    halfTime: { home: null, away: null },
    regularTime: { home: null, away: null },
    extraTime: { home: null, away: null },
    penalties: { home: null, away: null },
  }
}
