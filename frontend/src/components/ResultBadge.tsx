import { AlertOctagon, AlertTriangle, CheckCircle, Flame } from 'lucide-react'
import { cn, predictionMeta } from '../lib/utils'
import type { PredictionLabel } from '../types'

type ResultBadgeProps = {
  prediction: PredictionLabel
  compact?: boolean
}

export function ResultBadge({ prediction, compact }: ResultBadgeProps) {
  const iconClass = compact ? 'h-3.5 w-3.5' : 'h-5 w-5'
  const textClass = compact
    ? 'text-[0.65rem] tracking-[0.16em]'
    : 'text-base tracking-[0.2em]'
  const Icon =
    prediction === 'Normal'
      ? CheckCircle
      : prediction === 'Drusen'
        ? AlertTriangle
        : prediction === 'DME'
          ? Flame
          : AlertOctagon

  const meta = predictionMeta[prediction]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 font-mono font-semibold uppercase',
        meta.bgClass,
        meta.borderClass,
        meta.textClass,
        textClass,
        compact ? 'w-auto py-1.5' : 'w-full py-3.5',
      )}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full',
          compact ? 'h-6 w-6 text-[0.65rem]' : 'h-8 w-8 text-sm',
          meta.iconBg ?? meta.bgClass,
        )}
      >
        <Icon className={iconClass} />
      </span>
      {prediction}
    </div>
  )
}
