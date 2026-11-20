import { create } from 'zustand'
import type { PatientFormValues, PredictionResult } from '../types'

type AppState = {
  currentPatient: Partial<PatientFormValues> | null
  currentImage: File | null
  result: PredictionResult | null
  history: PredictionResult[]
  setPatient: (data: Partial<PatientFormValues>) => void
  setImage: (file: File | null) => void
  setResult: (result: PredictionResult | null) => void
  addToHistory: (result: PredictionResult) => void
  clearCurrent: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPatient: null,
  currentImage: null,
  result: null,
  history: [],
  setPatient: (data) => {
    set((state) => ({
      currentPatient: { ...(state.currentPatient ?? {}), ...data },
    }))
  },
  setImage: (file) => set({ currentImage: file }),
  setResult: (result) => set({ result }),
  addToHistory: (result) => {
    set((state) => {
      if (state.history.some((entry) => entry.id === result.id)) {
        return state
      }

      return { history: [result, ...state.history] }
    })
  },
  clearCurrent: () =>
    set({
      currentPatient: null,
      currentImage: null,
      result: null,
    }),
}))
