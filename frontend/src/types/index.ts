export type Gender = 'Male' | 'Female' | 'Other'
export type EyeExamined = 'Left' | 'Right' | 'Both'
export type PredictionLabel = 'Normal' | 'Drusen' | 'DME' | 'CNV'

export type AMDProbabilities = {
  NORMAL: number
  DRUSEN: number
  DME: number
  CNV: number
}

export type StageProbabilities = {
  BEGINNER: number
  INTERMEDIATE: number
  ADVANCED: number
}

export type VisibilityProbability = {
  VISIBILITY: number
}

export type LLMAnalysis = {
  diagnosis: string
  treatment: string
  summary: string
} | null

export type PatientFormValues = {
  patientName: string
  patientId: string
  age: number
  gender: Gender
  eyeExamined: EyeExamined
  scanDate: string
}

export type PatientFormDraft = {
  patientName: string
  patientId: string
  age: number | ''
  gender: Gender | ''
  eyeExamined: EyeExamined | ''
  scanDate: string
}

export type PredictionBreakdown = {
  label: PredictionLabel
  probability: number
}

export type PredictionResult = {
  id: string
  patientName: string
  patientId: string
  age: number
  gender: Gender
  eyeExamined: EyeExamined
  scanDate: string
  prediction: PredictionLabel
  confidence: number
  classBreakdown: PredictionBreakdown[]
  stageBreakdown: StageProbabilities
  visibility: VisibilityProbability
  llmAnalysis: LLMAnalysis
  octImageUrl: string
  timestamp: string
}

export type ToastState = {
  id: string
  message: string
  type: 'success' | 'error'
}
