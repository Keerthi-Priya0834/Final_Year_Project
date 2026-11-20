import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ScanEye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HistoryCard } from '../components/HistoryCard'
import { SectionHeader } from '../components/SectionHeader'
import { fetchScans } from '../lib/api'
import { useAppStore } from '../store/useAppStore'

type SortBy = 'date' | 'name' | 'result'

export function HistoryPage() {
  const navigate = useNavigate()
  const fallbackHistory = useAppStore((state) => state.history)
  const [sortBy, setSortBy] = useState<SortBy>('date')

  const { data, isLoading } = useQuery({
    queryKey: ['scans', 'history'],
    queryFn: () => fetchScans(1, 100),
  })

  const history = data?.items ?? fallbackHistory

  const sortedHistory = useMemo(() => {
    const copied = [...history]

    if (sortBy === 'name') {
      copied.sort((a, b) => a.patientName.localeCompare(b.patientName))
      return copied
    }

    if (sortBy === 'result') {
      copied.sort((a, b) => a.prediction.localeCompare(b.prediction))
      return copied
    }

    copied.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    return copied
  }, [history, sortBy])

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[68vh] w-full max-w-[900px] items-center justify-center rounded-xl border border-field-border bg-surface px-6 text-center text-text-secondary">
        Loading scan history...
      </div>
    )
  }

  if (!history.length) {
    return (
      <div className="mx-auto flex min-h-[68vh] w-full max-w-[900px] flex-col items-center justify-center rounded-xl border border-field-border bg-surface px-6 text-center">
        <ScanEye className="h-14 w-14 text-text-secondary/30" />
        <h2 className="mt-4 text-2xl font-semibold text-text-primary">No scans recorded yet</h2>
        <p className="mt-2 text-text-secondary">Run your first analysis to see results here.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="mt-5 rounded-lg bg-accent px-5 py-3 font-semibold text-white active:scale-[0.97]"
        >
          New Scan
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-4">
      <section className="rounded-xl border border-field-border bg-surface p-5 sm:p-6">
        <SectionHeader
          title="Scan History"
          rightSlot={
            <span className="rounded-full border border-field-border bg-field px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary">
              {history.length} records
            </span>
          }
        />

        <div className="mb-4 flex items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-text-secondary">
            Sort by:
          </span>
          {([
            ['date', 'Date'],
            ['name', 'Name'],
            ['result', 'Result'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value)}
              className={`rounded-full border px-3 py-1 font-mono text-[0.63rem] uppercase tracking-[0.16em] ${
                sortBy === value
                  ? 'border-accent text-accent'
                  : 'border-field-border text-text-secondary'
              }`}
            >
              {label}
              {sortBy === value ? ' ↓' : ''}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {sortedHistory.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      </section>
    </div>
  )
}
