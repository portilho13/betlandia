'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Competition, Area, Season } from '@/types/football'

export default function CompetitionsClient({
  competitions: initial,
  areas,
  seasons,
}: {
  competitions: Competition[]
  areas: Area[]
  seasons: Season[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [competitions, setCompetitions] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)

  const refresh = () => startTransition(() => router.refresh())

  async function deleteComp(id: number) {
    if (!confirm('Delete this competition?')) return
    const comp = competitions.find((c) => c.id === id)
    if (!comp) return
    await fetch(`/v4/competitions/${comp.code}`, { method: 'DELETE' })
    setCompetitions((prev) => prev.filter((c) => c.id !== id))
    refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitions</h1>
          <p className="text-xs text-gray-500 mt-1">{competitions.length} competitions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded transition-colors font-medium"
        >
          + Add Competition
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {competitions.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No competitions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Competition</th>
                <th className="text-left px-5 py-3 font-medium">Code</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Area</th>
                <th className="text-left px-5 py-3 font-medium">Current Season</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {competitions.map((c) => {
                const area = areas.find((a) => a.id === c.areaId)
                const season = c.currentSeasonId ? seasons.find((s) => s.id === c.currentSeasonId) : null
                return (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-3 text-green-400 font-mono text-xs">{c.code}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{c.type}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{area?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {season ? `${season.startDate} – ${season.endDate}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deleteComp(c.id)}
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
        <CreateCompetitionModal
          areas={areas}
          onClose={() => setShowCreate(false)}
          onCreate={(comp) => {
            setCompetitions((prev) => [...prev, comp])
            setShowCreate(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function CreateCompetitionModal({
  areas,
  onClose,
  onCreate,
}: {
  areas: Area[]
  onClose: () => void
  onCreate: (comp: Competition) => void
}) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'LEAGUE',
    areaId: areas[0]?.id ?? 1,
    seasonStart: '',
    seasonEnd: '',
    currentMatchday: 1,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.code) {
      setError('Name and code are required')
      return
    }
    setBusy(true)
    setError('')

    const compRes = await fetch('/v4/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        code: form.code.toUpperCase(),
        type: form.type,
        areaId: form.areaId,
      }),
    })

    if (!compRes.ok) {
      setBusy(false)
      setError('Failed to create competition')
      return
    }

    const comp: Competition = await compRes.json()

    if (form.seasonStart && form.seasonEnd) {
      const sRes = await fetch('/v4/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: form.seasonStart,
          endDate: form.seasonEnd,
          currentMatchday: form.currentMatchday,
          winner: null,
          competitionId: comp.id,
        }),
      }).catch(() => null)

      if (sRes?.ok) {
        const season = await sRes.json()
        await fetch(`/v4/competitions/${comp.code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentSeasonId: season.id }),
        })
        comp.currentSeasonId = season.id
      }
    }

    setBusy(false)
    onCreate(comp)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Competition</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Primeira Liga"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. PPL"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              >
                {['LEAGUE', 'CUP', 'SUPER_CUP', 'PLAYOFFS'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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

          <div className="border-t border-gray-700 pt-3">
            <p className="text-xs text-gray-500 mb-3">Season (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.seasonStart}
                  onChange={(e) => setForm((f) => ({ ...f, seasonStart: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={form.seasonEnd}
                  onChange={(e) => setForm((f) => ({ ...f, seasonEnd: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded transition-colors font-medium disabled:opacity-50">
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
