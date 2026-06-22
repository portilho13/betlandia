'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Team, Area } from '@/types/football'

export default function TeamsClient({
  teams: initialTeams,
  areas,
}: {
  teams: Team[]
  areas: Area[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [teams, setTeams] = useState(initialTeams)
  const [showCreate, setShowCreate] = useState(false)

  const refresh = () => startTransition(() => router.refresh())

  async function deleteTeam(id: number) {
    if (!confirm('Delete this team?')) return
    await fetch(`/v4/teams/${id}`, { method: 'DELETE' })
    setTeams((prev) => prev.filter((t) => t.id !== id))
    refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-xs text-gray-500 mt-1">{teams.length} teams</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded transition-colors font-medium"
        >
          + Add Team
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {teams.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No teams yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Team</th>
                <th className="text-left px-5 py-3 font-medium">TLA</th>
                <th className="text-left px-5 py-3 font-medium">Venue</th>
                <th className="text-left px-5 py-3 font-medium">Founded</th>
                <th className="text-left px-5 py-3 font-medium">Colors</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {teams.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.shortName}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{t.tla}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.venue ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.founded ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.clubColors ?? '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteTeam(t.id)}
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

      {showCreate && (
        <CreateTeamModal
          areas={areas}
          onClose={() => setShowCreate(false)}
          onCreate={(team) => {
            setTeams((prev) => [...prev, team])
            setShowCreate(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function CreateTeamModal({
  areas,
  onClose,
  onCreate,
}: {
  areas: Area[]
  onClose: () => void
  onCreate: (team: Team) => void
}) {
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    tla: '',
    areaId: areas[0]?.id ?? 1,
    venue: '',
    founded: '',
    clubColors: '',
    website: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setBusy(true)
    setError('')
    const res = await fetch('/v4/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        shortName: form.shortName || form.name,
        tla: form.tla || form.name.slice(0, 3).toUpperCase(),
        areaId: form.areaId,
        venue: form.venue || null,
        founded: form.founded ? Number(form.founded) : null,
        clubColors: form.clubColors || null,
        website: form.website || null,
        crest: null,
        address: null,
      }),
    })
    setBusy(false)
    if (res.ok) {
      const team = await res.json()
      onCreate(team)
    } else {
      setError('Failed to create team')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Team</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sporting CP"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Short Name</label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                placeholder="e.g. Sporting"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">TLA</label>
              <input
                type="text"
                value={form.tla}
                onChange={(e) => setForm((f) => ({ ...f, tla: e.target.value.toUpperCase() }))}
                placeholder="e.g. SCP"
                maxLength={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Founded</label>
              <input
                type="number"
                value={form.founded}
                onChange={(e) => setForm((f) => ({ ...f, founded: e.target.value }))}
                placeholder="e.g. 1906"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Area</label>
              <select
                value={form.areaId}
                onChange={(e) => setForm((f) => ({ ...f, areaId: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Venue</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              placeholder="e.g. Estádio José Alvalade"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Club Colors</label>
            <input
              type="text"
              value={form.clubColors}
              onChange={(e) => setForm((f) => ({ ...f, clubColors: e.target.value }))}
              placeholder="e.g. Green / White"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded transition-colors font-medium disabled:opacity-50">
              {busy ? 'Adding…' : 'Add Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
