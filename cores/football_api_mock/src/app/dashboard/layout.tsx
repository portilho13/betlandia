'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/matches', label: 'Matches', icon: '⚽' },
  { href: '/dashboard/teams', label: 'Teams', icon: '🏟️' },
  { href: '/dashboard/competitions', label: 'Competitions', icon: '🏆' },
  { href: '/dashboard/players', label: 'Players', icon: '👤' },
  { href: '/dashboard/users', label: 'Users & Balance', icon: '💰' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-lg">⚽</span>
            <span className="font-bold text-white text-sm">Football API Mock</span>
          </div>
          <span className="text-xs text-gray-500">Betlandia Dev Tool</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  active
                    ? 'bg-green-500/10 text-green-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">API Base URL</p>
          <code className="text-xs text-green-400 break-all">localhost:3001/v4</code>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
