import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ClassBreakdown } from './ClassBreakdown'
import { ResultBadge } from './ResultBadge'
import { cn, compactEyeLabel, formatDate, patientInitials, predictionMeta } from '../lib/utils'
import type { PredictionResult } from '../types'

type HistoryCardProps = {
  record: PredictionResult
}

export function HistoryCard({ record }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const initials = useMemo(() => patientInitials(record.patientName), [record.patientName])
  const colorMeta = predictionMeta[record.prediction]

  return (
    <article className="overflow-hidden rounded-xl border border-field-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="grid w-full grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-4 text-left sm:gap-4"
      >
        <div
          className={cn(
            'grid h-10 w-10 place-items-center rounded-full font-mono text-xs font-semibold',
            colorMeta.bgClass,
            colorMeta.textClass,
          )}
        >
          {initials}
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary">{record.patientName}</p>
          <p className="font-mono text-xs text-text-secondary">{record.patientId}</p>
        </div>

        <span className="rounded-full border border-field-border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-text-secondary">
          {compactEyeLabel(record.eyeExamined)}
        </span>

        <span className="hidden font-mono text-xs text-text-secondary sm:block">
          {formatDate(record.scanDate)}
        </span>

        <ResultBadge prediction={record.prediction} compact />

        <div className="flex items-center gap-2 font-mono text-sm text-text-primary">
          <span>{record.confidence.toFixed(1)}%</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-secondary transition-transform duration-300',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'grid grid-cols-1 gap-4 overflow-hidden border-t border-field-border px-4 transition-[max-height,padding] duration-300 ease-out sm:grid-cols-[120px_1fr]',
          expanded ? 'max-h-80 py-4' : 'max-h-0 py-0',
        )}
      >
        <div className="h-[92px] overflow-hidden rounded-lg border border-field-border bg-field">
          <img
            src={record.octImageUrl}
            alt={`OCT scan for ${record.patientName}`}
            className="h-full w-full object-cover"
          />
        </div>
        <ClassBreakdown breakdown={record.classBreakdown} compact />
      </div>
    </article>
  )
}
