import { db } from '@/lib/db'
import CompetitionsClient from './CompetitionsClient'

export const dynamic = 'force-dynamic'

export default function CompetitionsPage() {
  const competitions = db.competitions.all()
  const areas = db.areas.all()
  const seasons = db.seasons.all()
  return <CompetitionsClient competitions={competitions} areas={areas} seasons={seasons} />
}
