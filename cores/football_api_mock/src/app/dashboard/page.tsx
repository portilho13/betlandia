import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const matches = db.matches.all()
  const teams = db.teams.all()
  const competitions = db.competitions.all()
  const players = db.players.all()

  const live = matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  const scheduled = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
  const finished = matches.filter((m) => m.status === 'FINISHED')

  const stats = [
    { label: 'Total Matches', value: matches.length, color: 'text-white' },
    { label: 'Live Now', value: live.length, color: 'text-green-400' },
    { label: 'Scheduled', value: scheduled.length, color: 'text-yellow-400' },
    { label: 'Finished', value: finished.length, color: 'text-gray-400' },
    { label: 'Teams', value: teams.length, color: 'text-blue-400' },
    { label: 'Competitions', value: competitions.length, color: 'text-purple-400' },
    { label: 'Players', value: players.length, color: 'text-orange-400' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Football API Mock — Control Panel</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Live Matches
          </h2>
          <div className="space-y-2">
            {live.map((m) => {
              const home = teams.find((t) => t.id === m.homeTeamId)
              const away = teams.find((t) => t.id === m.awayTeamId)
              return (
                <div
                  key={m.id}
                  className="bg-gray-900 border border-green-900/50 rounded-lg px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{home?.shortName ?? '?'}</span>
                    <span className="text-green-400 font-bold text-lg">
                      {m.score.fullTime.home ?? 0} – {m.score.fullTime.away ?? 0}
                    </span>
                    <span className="text-white font-medium">{away?.shortName ?? '?'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.minute && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        {m.minute}&apos;
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{m.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          API Endpoints
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 font-mono text-xs space-y-1 text-gray-300">
          {[
            'GET  /v4/competitions',
            'GET  /v4/competitions/{code}',
            'GET  /v4/competitions/{code}/matches?dateFrom=&dateTo=',
            'GET  /v4/competitions/{code}/teams',
            'GET  /v4/competitions/{code}/standings',
            'GET  /v4/competitions/{code}/scorers',
            'GET  /v4/matches?dateFrom=&dateTo=&status=',
            'GET  /v4/matches/{id}',
            'POST /v4/matches/{id}/goals',
            'GET  /v4/teams',
            'GET  /v4/teams/{id}',
            'GET  /v4/areas',
            'GET  /v4/areas/{id}',
            'GET  /v4/players/{id}',
          ].map((ep) => (
            <div key={ep} className="flex gap-3">
              <span
                className={
                  ep.startsWith('POST')
                    ? 'text-yellow-400'
                    : ep.startsWith('GET')
                      ? 'text-green-400'
                      : 'text-blue-400'
                }
              >
                {ep.split(' ')[0]}
              </span>
              <span>{ep.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
