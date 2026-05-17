export interface Area {
  id: number
  name: string
  code: string
  flag: string | null
  parentAreaId: number | null
  parentArea: string | null
}

export interface Competition {
  id: number
  name: string
  code: string
  type: string
  emblem: string | null
  areaId: number
  currentSeasonId: number | null
}

export interface Season {
  id: number
  startDate: string
  endDate: string
  currentMatchday: number
  winner: string | null
  competitionId: number
}

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string | null
  areaId: number
  address: string | null
  website: string | null
  founded: number | null
  clubColors: string | null
  venue: string | null
}

export interface Player {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  countryOfBirth: string
  nationality: string
  position: string
  teamId: number
  lastUpdated: string
}

export interface ScoreDetail {
  home: number | null
  away: number | null
}

export interface Score {
  winner: string | null
  duration: string
  fullTime: ScoreDetail
  halfTime: ScoreDetail
  regularTime: ScoreDetail
  extraTime: ScoreDetail
  penalties: ScoreDetail
}

export interface Goal {
  minute: number
  injuryTime: number | null
  type: string
  team: { id: number; name: string }
  scorer: { id: number; name: string } | null
  assist: { id: number; name: string } | null
}

export interface Booking {
  minute: number
  team: { id: number; name: string }
  player: { id: number; name: string }
  card: string
}

export interface Substitution {
  minute: number
  team: { id: number; name: string }
  playerOut: { id: number; name: string }
  playerIn: { id: number; name: string }
}

export interface Referee {
  id: number
  name: string
  type: string
  nationality: string
}

export interface Match {
  id: number
  competitionId: number
  seasonId: number
  areaId: number
  utcDate: string
  status: string
  minute: number | null
  attendance: number | null
  venue: string | null
  matchday: number
  stage: string
  group: string | null
  lastUpdated: string
  homeTeamId: number
  awayTeamId: number
  score: Score
  goals: Goal[]
  bookings: Booking[]
  substitutions: Substitution[]
  referees: Referee[]
}

export type MatchStatus =
  | 'TIMED'
  | 'SCHEDULED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'SUSPENDED'
  | 'CANCELLED'
