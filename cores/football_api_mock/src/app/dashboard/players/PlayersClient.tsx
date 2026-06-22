'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Player, Team } from '@/types/football'

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

export default function PlayersClient({
  players: initialPlayers,
  teams,
}: {
  players: Player[]
  teams: Team[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [players, setPlayers] = useState(initialPlayers)
  const [showCreate, setShowCreate] = useState(false)
  const [filterTeam, setFilterTeam] = useState<number | 'all'>('all')

  const refresh = () => startTransition(() => router.refresh())

  async function deletePlayer(id: number) {
    if (!confirm('Delete this player?')) return
    await fetch(`/v4/players/${id}`, { method: 'DELETE' })
    setPlayers((prev) => prev.filter((p) => p.id !== id))
    refresh()
  }

  const filtered =
    filterTeam === 'all' ? players : players.filter((p) => p.teamId === filterTeam)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <p className="text-xs text-gray-500 mt-1">{players.length} players</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterTeam}
            onChange={(e) =>
              setFilterTeam(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.shortName}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded transition-colors font-medium"
          >
            + Add Player
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No players yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Player</th>
                <th className="text-left px-5 py-3 font-medium">Team</th>
                <th className="text-left px-5 py-3 font-medium">Position</th>
                <th className="text-left px-5 py-3 font-medium">Nationality</th>
                <th className="text-left px-5 py-3 font-medium">DOB</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((p) => {
                const team = teams.find((t) => t.id === p.teamId)
                return (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">#{p.id}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{team?.shortName ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.position}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.nationality}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.dateOfBirth}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deletePlayer(p.id)}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreatePlayerModal
          teams={teams}
          onClose={() => setShowCreate(false)}
          onCreate={(player) => {
            setPlayers((prev) => [...prev, player])
            setShowCreate(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function CreatePlayerModal({
  teams,
  onClose,
  onCreate,
}: {
  teams: Team[]
  onClose: () => void
  onCreate: (player: Player) => void
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    position: 'Forward',
    teamId: teams[0]?.id ?? 1,
    countryOfBirth: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName) {
      setError('First and last name are required')
      return
    }
    setBusy(true)
    setError('')
    const playersRes = await fetch('/v4/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth || '1990-01-01',
        countryOfBirth: form.countryOfBirth || form.nationality,
        nationality: form.nationality || 'Unknown',
        position: form.position,
        teamId: form.teamId,
        lastUpdated: new Date().toISOString(),
      }),
    })
    setBusy(false)
    if (playersRes.ok) {
      const player = await playersRes.json()
      onCreate(player)
    } else {
      setError('Failed to create player')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Player</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Team</label>
              <select
                value={form.teamId}
                onChange={(e) => setForm((f) => ({ ...f, teamId: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.shortName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                placeholder="e.g. Portuguese"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded transition-colors font-medium disabled:opacity-50">
              {busy ? 'Adding…' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
