import type { PredictionLabel } from '../types'

export const predictionMeta: Record<
  PredictionLabel,
  {
    textClass: string
    bgClass: string
    borderClass: string
    iconBg?: string
  }
> = {
  Normal: {
    textClass: 'text-success',
    bgClass: 'bg-success/15',
    borderClass: 'border-success/55',
    iconBg: 'bg-success/20',
  },
  Drusen: {
    textClass: 'text-accent',
    bgClass: 'bg-accent/15',
    borderClass: 'border-accent/55',
    iconBg: 'bg-accent/20',
  },
  DME: {
    textClass: 'text-warning',
    bgClass: 'bg-warning/15',
    borderClass: 'border-warning/55',
    iconBg: 'bg-warning/20',
  },
  CNV: {
    textClass: 'text-danger',
    bgClass: 'bg-danger/15',
    borderClass: 'border-danger/55',
    iconBg: 'bg-danger/20',
  },
}

export const probabilityBarColors: Record<PredictionLabel, string> = {
  Normal: 'bg-success',
  Drusen: 'bg-accent',
  DME: 'bg-warning',
  CNV: 'bg-danger',
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function compactEyeLabel(value: 'Left' | 'Right' | 'Both') {
  if (value === 'Left') {
    return 'L'
  }

  if (value === 'Right') {
    return 'R'
  }

  return 'B'
}

export function patientInitials(name: string) {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!segments.length) {
    return 'NA'
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join('')
}

export function formatSize(size: number) {
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  return `${(kb / 1024).toFixed(2)} MB`
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
