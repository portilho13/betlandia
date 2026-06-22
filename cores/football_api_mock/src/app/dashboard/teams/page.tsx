import { db } from '@/lib/db'
import TeamsClient from './TeamsClient'

export const dynamic = 'force-dynamic'

export default function TeamsPage() {
  const teams = db.teams.all()
  const areas = db.areas.all()
  return <TeamsClient teams={teams} areas={areas} />
}
