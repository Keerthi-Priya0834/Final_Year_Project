import { useEffect, useState } from 'react'
import { cn, probabilityBarColors } from '../lib/utils'
import { percentToWidthClass } from '../lib/widthClasses'
import type { PredictionLabel } from '../types'

type ConfidenceBarProps = {
  value: number
  prediction: PredictionLabel
}

export function ConfidenceBar({ value, prediction }: ConfidenceBarProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplay(value)
    }, 50)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
        Confidence Score
      </p>
      <p className="mt-2 font-mono text-5xl font-semibold text-text-primary">
        {value.toFixed(1)}%
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-field-border">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            probabilityBarColors[prediction],
            percentToWidthClass(display),
          )}
        />
      </div>
    </div>
  )
}
