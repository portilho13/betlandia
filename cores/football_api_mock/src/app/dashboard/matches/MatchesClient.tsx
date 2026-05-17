'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Team, Competition } from '@/types/football'

type EnrichedMatch = Match & {
  homeTeam: Team | null
  awayTeam: Team | null
  competition: Competition | null
}

const STATUS_OPTIONS = [
  'SCHEDULED',
  'TIMED',
  'IN_PLAY',
  'PAUSED',
  'FINISHED',
  'POSTPONED',
  'SUSPENDED',
  'CANCELLED',
] as const

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'text-yellow-400 bg-yellow-400/10',
  TIMED: 'text-yellow-400 bg-yellow-400/10',
  IN_PLAY: 'text-green-400 bg-green-400/10',
  PAUSED: 'text-blue-400 bg-blue-400/10',
  FINISHED: 'text-gray-400 bg-gray-400/10',
  POSTPONED: 'text-orange-400 bg-orange-400/10',
  SUSPENDED: 'text-red-400 bg-red-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
}

export default function MatchesClient({
  matches: initialMatches,
  teams,
  competitions,
}: {
  matches: EnrichedMatch[]
  teams: Team[]
  competitions: Competition[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [matches, setMatches] = useState(initialMatches)
  const [busy, setBusy] = useState(false)

  const selected = matches.find((m) => m.id === selectedId) ?? null

  const refresh = () => {
    startTransition(() => router.refresh())
  }

  async function patchMatch(id: number, body: object) {
    setBusy(true)
    const res = await fetch(`/v4/matches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      const updated = data.match
      setMatches((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...updated,
                homeTeam: teams.find((t) => t.id === updated.homeTeam?.id) ?? m.homeTeam,
                awayTeam: teams.find((t) => t.id === updated.awayTeam?.id) ?? m.awayTeam,
                competition: m.competition,
              }
            : m,
        ),
      )
    }
  }

  async function addGoal(id: number, teamId: number, goalType = 'REGULAR') {
    const match = matches.find((m) => m.id === id)
    if (!match) return
    const team = teams.find((t) => t.id === teamId)
    if (!team) return
    setBusy(true)
    const res = await fetch(`/v4/matches/${id}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minute: match.minute ?? 1,
        type: goalType,
        team: { id: team.id, name: team.name },
      }),
    })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      const updated = data.match
      setMatches((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...updated,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                competition: m.competition,
              }
            : m,
        ),
      )
    }
  }

  async function removeLastGoal(id: number) {
    setBusy(true)
    const res = await fetch(`/v4/matches/${id}/goals`, { method: 'DELETE' })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      const updated = data.match
      setMatches((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...updated,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                competition: m.competition,
              }
            : m,
        ),
      )
    }
  }

  async function deleteMatch(id: number) {
    if (!confirm('Delete this match?')) return
    await fetch(`/v4/matches/${id}`, { method: 'DELETE' })
    setMatches((prev) => prev.filter((m) => m.id !== id))
    if (selectedId === id) setSelectedId(null)
    refresh()
  }

  return (
    <div className="flex h-full">
      {/* List panel */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">Matches</h1>
            <p className="text-xs text-gray-500 mt-0.5">{matches.length} total</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded transition-colors font-medium"
          >
            + Create Match
          </button>
        </div>

        <div className="overflow-auto flex-1">
          {matches.length === 0 ? (
            <div className="p-10 text-center text-gray-600">
              <p className="text-lg mb-2">No matches yet</p>
              <p className="text-sm">Create your first match to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900 border-b border-gray-800">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Match</th>
                  <th className="text-center px-4 py-3 font-medium">Score</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">MD</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {matches.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === m.id ? 'bg-green-950/30' : 'hover:bg-gray-900/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-white">
                        <span>{m.homeTeam?.shortName ?? `Team #${m.homeTeamId}`}</span>
                        <span className="text-gray-600">vs</span>
                        <span>{m.awayTeam?.shortName ?? `Team #${m.awayTeamId}`}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {m.competition?.name ?? '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.status === 'SCHEDULED' || m.status === 'TIMED' ? (
                        <span className="text-gray-600">–</span>
                      ) : (
                        <span className="font-bold text-white">
                          {m.score.fullTime.home ?? 0} : {m.score.fullTime.away ?? 0}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[m.status] ?? 'text-gray-400'}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(m.utcDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.matchday}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMatch(m.id)
                        }}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Simulation panel */}
      {selected && (
        <SimulationPanel
          match={selected}
          teams={teams}
          busy={busy}
          onPatch={(body) => patchMatch(selected.id, body)}
          onGoal={(teamId, type) => addGoal(selected.id, teamId, type)}
          onRemoveGoal={() => removeLastGoal(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Create match modal */}
      {showCreate && (
        <CreateMatchModal
          teams={teams}
          competitions={competitions}
          onClose={() => setShowCreate(false)}
          onCreate={(match) => {
            setMatches((prev) => [
              ...prev,
              {
                ...match,
                homeTeam: teams.find((t) => t.id === match.homeTeamId) ?? null,
                awayTeam: teams.find((t) => t.id === match.awayTeamId) ?? null,
                competition: competitions.find((c) => c.id === match.competitionId) ?? null,
              },
            ])
            setShowCreate(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function SimulationPanel({
  match,
  teams,
  busy,
  onPatch,
  onGoal,
  onRemoveGoal,
  onClose,
}: {
  match: EnrichedMatch
  teams: Team[]
  busy: boolean
  onPatch: (body: object) => void
  onGoal: (teamId: number, type: string) => void
  onRemoveGoal: () => void
  onClose: () => void
}) {
  const [minute, setMinute] = useState(match.minute ?? 1)
  const [htHome, setHtHome] = useState(match.score.halfTime.home ?? 0)
  const [htAway, setHtAway] = useState(match.score.halfTime.away ?? 0)

  const homeScore = match.score.fullTime.home ?? 0
  const awayScore = match.score.fullTime.away ?? 0

  return (
    <div className="w-96 bg-gray-900 flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-white text-sm">Simulate Match</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">
          ×
        </button>
      </div>

      <div className="overflow-auto flex-1 p-5 space-y-6">
        {/* Score display */}
        <div className="bg-gray-950 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 truncate max-w-[80px]">
                {match.homeTeam?.shortName ?? 'Home'}
              </p>
              <p className="text-5xl font-bold text-white">{homeScore}</p>
            </div>
            <div className="text-gray-600 text-xl font-light">—</div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 truncate max-w-[80px]">
                {match.awayTeam?.shortName ?? 'Away'}
              </p>
              <p className="text-5xl font-bold text-white">{awayScore}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[match.status] ?? 'text-gray-400'}`}>
              {match.status}
              {match.minute ? ` · ${match.minute}'` : ''}
            </span>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Match Status
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => onPatch({ status: s, minute: s === 'IN_PLAY' ? minute : null })}
                className={`text-xs py-1.5 px-2 rounded transition-colors ${
                  match.status === s
                    ? 'bg-green-600 text-white font-medium'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Minute */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Match Minute
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={120}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-green-500"
            />
            <button
              disabled={busy}
              onClick={() => onPatch({ minute })}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Set
            </button>
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Goals
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              disabled={busy}
              onClick={() => onGoal(match.homeTeamId, 'REGULAR')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 px-3 rounded transition-colors font-medium"
            >
              ⚽ {match.homeTeam?.shortName ?? 'Home'}
            </button>
            <button
              disabled={busy}
              onClick={() => onGoal(match.awayTeamId, 'REGULAR')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm py-2.5 px-3 rounded transition-colors font-medium"
            >
              ⚽ {match.awayTeam?.shortName ?? 'Away'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              disabled={busy}
              onClick={() => onGoal(match.homeTeamId, 'PENALTY')}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 px-3 rounded transition-colors"
            >
              PEN {match.homeTeam?.tla}
            </button>
            <button
              disabled={busy}
              onClick={() => onGoal(match.awayTeamId, 'PENALTY')}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 px-3 rounded transition-colors"
            >
              PEN {match.awayTeam?.tla}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              disabled={busy}
              onClick={() => onGoal(match.homeTeamId, 'OWN')}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 px-3 rounded transition-colors text-red-400"
            >
              OG {match.homeTeam?.tla}
            </button>
            <button
              disabled={busy}
              onClick={() => onGoal(match.awayTeamId, 'OWN')}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 px-3 rounded transition-colors text-red-400"
            >
              OG {match.awayTeam?.tla}
            </button>
          </div>
          <button
            disabled={busy || (match.goals?.length ?? 0) === 0}
            onClick={onRemoveGoal}
            className="w-full bg-gray-800 hover:bg-red-900/30 hover:text-red-400 text-gray-400 text-xs py-1.5 px-3 rounded transition-colors disabled:opacity-40"
          >
            ↩ Undo Last Goal
          </button>
        </div>

        {/* Half-time score */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Half-Time Score
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={htHome}
              onChange={(e) => setHtHome(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm w-16 text-center focus:outline-none focus:border-green-500"
            />
            <span className="text-gray-600">–</span>
            <input
              type="number"
              min={0}
              value={htAway}
              onChange={(e) => setHtAway(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm w-16 text-center focus:outline-none focus:border-green-500"
            />
            <button
              disabled={busy}
              onClick={() =>
                onPatch({
                  score: {
                    ...match.score,
                    halfTime: { home: htHome, away: htAway },
                  },
                })
              }
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Set HT
            </button>
          </div>
        </div>

        {/* Finish with winner */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Finish Match
          </label>
          <button
            disabled={busy}
            onClick={() => {
              const h = homeScore
              const a = awayScore
              const winner = h > a ? 'HOME_TEAM' : a > h ? 'AWAY_TEAM' : 'DRAW'
              onPatch({
                status: 'FINISHED',
                minute: null,
                score: {
                  ...match.score,
                  winner,
                  fullTime: { home: h, away: a },
                },
              })
            }}
            className="w-full bg-gray-700 hover:bg-green-700 text-white text-sm py-2 rounded transition-colors"
          >
            Finish & Set Winner
          </button>
        </div>

        {/* Goal log */}
        {(match.goals?.length ?? 0) > 0 && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
              Goals ({match.goals?.length})
            </label>
            <div className="space-y-1">
              {match.goals?.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-1.5 rounded">
                  <span className="text-gray-500">{g.minute}&apos;</span>
                  <span>{g.type !== 'REGULAR' ? `[${g.type}]` : '⚽'}</span>
                  <span>{g.team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateMatchModal({
  teams,
  competitions,
  onClose,
  onCreate,
}: {
  teams: Team[]
  competitions: Competition[]
  onClose: () => void
  onCreate: (match: Match) => void
}) {
  const [form, setForm] = useState({
    competitionId: competitions[0]?.id ?? 1,
    homeTeamId: teams[0]?.id ?? 1,
    awayTeamId: teams[1]?.id ?? 2,
    utcDate: new Date().toISOString().slice(0, 16),
    matchday: 1,
    stage: 'REGULAR_SEASON',
    venue: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.homeTeamId === form.awayTeamId) {
      setError('Home and away teams must be different')
      return
    }
    setBusy(true)
    setError('')
    const res = await fetch('/v4/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        utcDate: new Date(form.utcDate).toISOString(),
        venue: form.venue || null,
      }),
    })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      onCreate({
        ...data,
        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        competitionId: form.competitionId,
      })
    } else {
      setError('Failed to create match')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Create Match</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Competition</label>
            <select
              value={form.competitionId}
              onChange={(e) => setForm((f) => ({ ...f, competitionId: Number(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Home Team</label>
              <select
                value={form.homeTeamId}
                onChange={(e) => setForm((f) => ({ ...f, homeTeamId: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shortName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Away Team</label>
              <select
                value={form.awayTeamId}
                onChange={(e) => setForm((f) => ({ ...f, awayTeamId: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Date & Time (UTC)</label>
            <input
              type="datetime-local"
              value={form.utcDate}
              onChange={(e) => setForm((f) => ({ ...f, utcDate: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Matchday</label>
              <input
                type="number"
                min={1}
                value={form.matchday}
                onChange={(e) => setForm((f) => ({ ...f, matchday: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {['REGULAR_SEASON', 'KNOCKOUT', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Venue (optional)</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              placeholder="Stadium name"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded transition-colors font-medium disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
