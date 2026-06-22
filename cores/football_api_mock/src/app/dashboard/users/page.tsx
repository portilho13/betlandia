'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  walletBalance: number
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function addBalance(userId: string) {
    const amount = parseFloat(amounts[userId] || '0')
    if (amount === 0) return
    setBusy(userId)
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
        setAmounts((prev) => ({ ...prev, [userId]: '' }))
      }
    } catch {}
    setBusy(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Users & Balance</h1>
        <p className="text-xs text-gray-500 mt-0.5">{users.length} registered users</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-2">No users yet</p>
          <p className="text-sm">Users appear here after registering on the frontend</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">{user.id}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    {user.walletBalance.toFixed(2)} €
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10"
                    placeholder="Amount"
                    value={amounts[user.id] || ''}
                    onChange={(e) =>
                      setAmounts((prev) => ({ ...prev, [user.id]: e.target.value }))
                    }
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm w-28 focus:outline-none focus:border-green-500"
                  />
                  <button
                    disabled={busy === user.id}
                    onClick={() => addBalance(user.id)}
                    className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-1.5 rounded transition-colors font-medium disabled:opacity-50"
                  >
                    {busy === user.id ? '...' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
