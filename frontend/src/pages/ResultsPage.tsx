import { useNavigate } from '@tanstack/react-router'
import { BookmarkPlus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { requireResult } from '../routes/guards'
import { ClassBreakdown } from '../components/ClassBreakdown'
import { ConfidenceBar } from '../components/ConfidenceBar'
import { ResultBadge } from '../components/ResultBadge'
import { SectionHeader } from '../components/SectionHeader'
import { Toast } from '../components/Toast'
import { formatDate } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'
import type { ToastState } from '../types'

export function ResultsPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<ToastState | null>(null)

  const result = useAppStore((state) => state.result)
  const history = useAppStore((state) => state.history)
  const addToHistory = useAppStore((state) => state.addToHistory)
  const clearCurrent = useAppStore((state) => state.clearCurrent)

  const alreadySaved = result ? history.some((entry) => entry.id === result.id) : false

  if (!result) {
    return null
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-[960px] grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-field-border bg-surface p-5 sm:p-6">
          <SectionHeader title="OCT Scan" />
          <div className="h-[360px] overflow-hidden rounded-xl border border-field-border bg-field">
            <img
              src={result.octImageUrl}
              alt={`OCT scan for ${result.patientName}`}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 font-mono text-xs text-text-secondary sm:grid-cols-2">
            <p>
              Patient: <span className="text-text-primary">{result.patientName}</span> · ID:{' '}
              <span className="text-text-primary">{result.patientId}</span>
            </p>
            <p>
              Age: <span className="text-text-primary">{result.age}</span> · Gender:{' '}
              <span className="text-text-primary">{result.gender}</span>
            </p>
            <p>
              Eye: <span className="text-text-primary">{result.eyeExamined}</span> · Date:{' '}
              <span className="text-text-primary">{formatDate(result.scanDate)}</span>
            </p>
          </div>

          {result.llmAnalysis &&
          (result.llmAnalysis.diagnosis || result.llmAnalysis.treatment || result.llmAnalysis.summary) ? (
            <div className="mt-5 rounded-lg border border-field-border bg-field p-4">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
                AI Clinical Summary
              </p>
              <div className="mt-3 space-y-2 text-sm text-text-primary">
                <div>
                  <span className="font-semibold text-text-secondary">Diagnosis: </span>
                  <span>{result.llmAnalysis.diagnosis || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-secondary">Treatment: </span>
                  <span>{result.llmAnalysis.treatment || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-secondary">Summary: </span>
                  <span>{result.llmAnalysis.summary || '—'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-field-border bg-field p-4">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
                AI Clinical Summary
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                AI analysis is not available for this scan.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-field-border bg-surface p-5 sm:p-6">
          <SectionHeader title="Diagnosis" />

          <ResultBadge prediction={result.prediction} />

          <div className="mt-6">
            <ConfidenceBar value={result.confidence} prediction={result.prediction} />
          </div>

          <div className="mt-6 space-y-6">
            <ClassBreakdown title="AMD Probabilities" breakdown={result.classBreakdown} />

            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
                Stage Probabilities
              </p>
              <div className="mt-3 space-y-2 text-sm text-text-primary">
                <ProbRow label="Beginner" value={result.stageBreakdown.BEGINNER} color="bg-success" />
                <ProbRow label="Intermediate" value={result.stageBreakdown.INTERMEDIATE} color="bg-warning" />
                <ProbRow label="Advanced" value={result.stageBreakdown.ADVANCED} color="bg-danger" />
              </div>
            </div>

            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">
                Visibility
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-field-border">
                  <div
                    className="h-full rounded-full bg-info transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, result.visibility.VISIBILITY))}%` }}
                  />
                </div>
                <span className="font-mono text-sm text-text-primary">
                  {result.visibility.VISIBILITY.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              disabled={alreadySaved}
              onClick={() => {
                addToHistory(result)
                setToast({
                  id: crypto.randomUUID(),
                  message: 'Saved to history',
                  type: 'success',
                })
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-accent disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.97]"
            >
              <BookmarkPlus className="h-4 w-4" />
              {alreadySaved ? 'Saved' : 'Save to History'}
            </button>

            <button
              type="button"
              onClick={() => {
                clearCurrent()
                navigate({ to: '/' })
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-field-border bg-field px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary active:scale-[0.97]"
            >
              <RefreshCw className="h-4 w-4" />
              New Scan
            </button>
          </div>
        </section>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

ResultsPage.beforeLoad = requireResult

function ProbRow({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value * 100))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-[0.16em] text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-field-border">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
