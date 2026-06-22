import { db } from '@/lib/db'
import PlayersClient from './PlayersClient'

export const dynamic = 'force-dynamic'

export default function PlayersPage() {
  const players = db.players.all()
  const teams = db.teams.all()
  return <PlayersClient players={players} teams={teams} />
}
