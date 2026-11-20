import { useEffect, useState } from 'react'
import { cn, probabilityBarColors } from '../lib/utils'
import { percentToWidthClass } from '../lib/widthClasses'
import type { PredictionBreakdown } from '../types'

type ClassBreakdownProps = {
  breakdown: PredictionBreakdown[]
  title?: string
  compact?: boolean
}

const delayByIndex = ['delay-0', 'delay-100', 'delay-200'] as const

export function ClassBreakdown({ breakdown, title = 'Class Probabilities', compact }: ClassBreakdownProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimate(true)
    }, 50)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div>
      {!compact ? (
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
          {title}
        </p>
      ) : null}

      <div className={compact ? 'space-y-2.5' : 'mt-3 space-y-3'}>
        {breakdown.map((entry, index) => (
          <div key={entry.label}>
             <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-[0.14em] text-text-secondary">
                {entry.label}
              </span>
              <span className="font-mono text-text-primary">
                {entry.probability.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-field-border">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-700 ease-out',
                  delayByIndex[index] ?? 'delay-0',
                  probabilityBarColors[entry.label],
                  animate ? percentToWidthClass(entry.probability) : 'w-[0%]',
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
