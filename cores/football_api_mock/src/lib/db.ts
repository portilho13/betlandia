import fs from 'fs'
import path from 'path'
import type { Area, Competition, Season, Team, Player, Match } from '@/types/football'

const DATA_DIR = path.join(process.cwd(), 'data')

function read<T>(file: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')) as T[]
  } catch {
    return []
  }
}

function write<T>(file: string, data: T[]): void {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8')
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1
}

export const db = {
  areas: {
    all: () => read<Area>('areas.json'),
    find: (id: number) => read<Area>('areas.json').find((a) => a.id === id) ?? null,
    create: (data: Omit<Area, 'id'>): Area => {
      const items = read<Area>('areas.json')
      const item: Area = { ...data, id: nextId(items) }
      write('areas.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Area>): Area | null => {
      const items = read<Area>('areas.json')
      const idx = items.findIndex((a) => a.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data }
      write('areas.json', items)
      return items[idx]
    },
    delete: (id: number): boolean => {
      const items = read<Area>('areas.json')
      const filtered = items.filter((a) => a.id !== id)
      if (filtered.length === items.length) return false
      write('areas.json', filtered)
      return true
    },
  },

  competitions: {
    all: () => read<Competition>('competitions.json'),
    find: (id: number) =>
      read<Competition>('competitions.json').find((c) => c.id === id) ?? null,
    findByCode: (code: string) =>
      read<Competition>('competitions.json').find((c) => c.code === code) ?? null,
    create: (data: Omit<Competition, 'id'>): Competition => {
      const items = read<Competition>('competitions.json')
      const item: Competition = { ...data, id: nextId(items) }
      write('competitions.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Competition>): Competition | null => {
      const items = read<Competition>('competitions.json')
      const idx = items.findIndex((c) => c.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data }
      write('competitions.json', items)
      return items[idx]
    },
    delete: (id: number): boolean => {
      const items = read<Competition>('competitions.json')
      const filtered = items.filter((c) => c.id !== id)
      if (filtered.length === items.length) return false
      write('competitions.json', filtered)
      return true
    },
  },

  seasons: {
    all: () => read<Season>('seasons.json'),
    find: (id: number) => read<Season>('seasons.json').find((s) => s.id === id) ?? null,
    findByCompetition: (competitionId: number) =>
      read<Season>('seasons.json').filter((s) => s.competitionId === competitionId),
    create: (data: Omit<Season, 'id'>): Season => {
      const items = read<Season>('seasons.json')
      const item: Season = { ...data, id: nextId(items) }
      write('seasons.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Season>): Season | null => {
      const items = read<Season>('seasons.json')
      const idx = items.findIndex((s) => s.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data }
      write('seasons.json', items)
      return items[idx]
    },
  },

  teams: {
    all: () => read<Team>('teams.json'),
    find: (id: number) => read<Team>('teams.json').find((t) => t.id === id) ?? null,
    create: (data: Omit<Team, 'id'>): Team => {
      const items = read<Team>('teams.json')
      const item: Team = { ...data, id: nextId(items) }
      write('teams.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Team>): Team | null => {
      const items = read<Team>('teams.json')
      const idx = items.findIndex((t) => t.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data }
      write('teams.json', items)
      return items[idx]
    },
    delete: (id: number): boolean => {
      const items = read<Team>('teams.json')
      const filtered = items.filter((t) => t.id !== id)
      if (filtered.length === items.length) return false
      write('teams.json', filtered)
      return true
    },
  },

  players: {
    all: () => read<Player>('players.json'),
    find: (id: number) => read<Player>('players.json').find((p) => p.id === id) ?? null,
    findByTeam: (teamId: number) =>
      read<Player>('players.json').filter((p) => p.teamId === teamId),
    create: (data: Omit<Player, 'id'>): Player => {
      const items = read<Player>('players.json')
      const item: Player = { ...data, id: nextId(items) }
      write('players.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Player>): Player | null => {
      const items = read<Player>('players.json')
      const idx = items.findIndex((p) => p.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data }
      write('players.json', items)
      return items[idx]
    },
    delete: (id: number): boolean => {
      const items = read<Player>('players.json')
      const filtered = items.filter((p) => p.id !== id)
      if (filtered.length === items.length) return false
      write('players.json', filtered)
      return true
    },
  },

  matches: {
    all: () => read<Match>('matches.json'),
    find: (id: number) => read<Match>('matches.json').find((m) => m.id === id) ?? null,
    findByCompetition: (competitionId: number) =>
      read<Match>('matches.json').filter((m) => m.competitionId === competitionId),
    query: (params: {
      competitionCode?: string
      dateFrom?: string
      dateTo?: string
      status?: string
      matchday?: number
    }) => {
      const competitions = read<Competition>('competitions.json')
      let matches = read<Match>('matches.json')

      if (params.competitionCode) {
        const comp = competitions.find((c) => c.code === params.competitionCode)
        if (!comp) return []
        matches = matches.filter((m) => m.competitionId === comp.id)
      }
      if (params.dateFrom) {
        matches = matches.filter((m) => m.utcDate >= params.dateFrom!)
      }
      if (params.dateTo) {
        matches = matches.filter((m) => m.utcDate <= params.dateTo! + 'T23:59:59Z')
      }
      if (params.status) {
        matches = matches.filter((m) => m.status === params.status)
      }
      if (params.matchday !== undefined) {
        matches = matches.filter((m) => m.matchday === params.matchday)
      }

      return matches
    },
    create: (data: Omit<Match, 'id'>): Match => {
      const items = read<Match>('matches.json')
      const item: Match = { ...data, id: nextId(items) }
      write('matches.json', [...items, item])
      return item
    },
    update: (id: number, data: Partial<Match>): Match | null => {
      const items = read<Match>('matches.json')
      const idx = items.findIndex((m) => m.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...data, lastUpdated: new Date().toISOString() }
      write('matches.json', items)
      return items[idx]
    },
    delete: (id: number): boolean => {
      const items = read<Match>('matches.json')
      const filtered = items.filter((m) => m.id !== id)
      if (filtered.length === items.length) return false
      write('matches.json', filtered)
      return true
    },
  },
}
