import type {
  AMDProbabilities,
  LLMAnalysis,
  PatientFormValues,
  PredictionResult,
  PredictionLabel,
  StageProbabilities,
  VisibilityProbability,
} from '../types'

type ApiScan = {
  id: string
  patient_name: string
  patient_id: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  eye_examined: 'LEFT' | 'RIGHT' | 'BOTH'
  scan_date: string
  prediction: 'NORMAL' | 'DRUSEN' | 'DME' | 'CNV'
  confidence: number
  amd_result: AMDProbabilities
  stage_result: StageProbabilities
  visibility_result: VisibilityProbability
  llm_analysis?: LLMAnalysis
  oct_image_url: string
  created_at: string
}

type PaginatedScansResponse = {
  items: ApiScan[]
  total: number
  page: number
  page_size: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function toPredictionResult(scan: ApiScan): PredictionResult {
  const mapPrediction = (value: ApiScan['prediction']): PredictionLabel => {
    switch (value) {
      case 'NORMAL':
        return 'Normal'
      case 'DRUSEN':
        return 'Drusen'
      case 'DME':
        return 'DME'
      case 'CNV':
        return 'CNV'
      default:
        return 'Normal'
    }
  }

  const amd = scan.amd_result ?? { NORMAL: 0, DRUSEN: 0, DME: 0, CNV: 0 }
  const stage = scan.stage_result ?? { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 }
  const visibility = scan.visibility_result ?? { VISIBILITY: 0 }

  const classBreakdown: PredictionResult['classBreakdown'] = [
    { label: 'Normal', probability: amd.NORMAL * 100 },
    { label: 'Drusen', probability: amd.DRUSEN * 100 },
    { label: 'DME', probability: amd.DME * 100 },
    { label: 'CNV', probability: amd.CNV * 100 },
  ]

  return {
    id: scan.id,
    patientName: scan.patient_name,
    patientId: scan.patient_id,
    age: scan.age,
    gender: mapGender(scan.gender),
    eyeExamined: mapEye(scan.eye_examined),
    scanDate: scan.scan_date,
    prediction: mapPrediction(scan.prediction),
    confidence: scan.confidence * 100,
    classBreakdown,
    stageBreakdown: stage,
    visibility,
    llmAnalysis: scan.llm_analysis ?? null,
    octImageUrl: scan.oct_image_url,
    timestamp: scan.created_at,
  }
}

function mapGender(value: ApiScan['gender']) {
  if (value === 'FEMALE') return 'Female'
  if (value === 'MALE') return 'Male'
  return 'Other'
}

function mapEye(value: ApiScan['eye_examined']) {
  if (value === 'LEFT') return 'Left'
  if (value === 'RIGHT') return 'Right'
  return 'Both'
}

export async function createScan(
  patient: PatientFormValues,
  file: File,
): Promise<PredictionResult> {
  const formData = new FormData()
  formData.append('patient_name', patient.patientName)
  formData.append('patient_id', patient.patientId)
  formData.append('age', String(patient.age))
  formData.append('gender', patient.gender)
  formData.append('eye_examined', patient.eyeExamined)
  const isoDate = new Date(patient.scanDate).toISOString()
  formData.append('scan_date', isoDate)
  formData.append('oct_image', file)

  const response = await fetch(`${API_BASE}/api/v1/scans/`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to create scan')
  }

  const data = (await response.json()) as ApiScan
  return toPredictionResult(data)
}

export async function fetchScans(
  page = 1,
  pageSize = 50,
): Promise<{ items: PredictionResult[]; total: number }> {
  const response = await fetch(
    `${API_BASE}/api/v1/scans/?page=${page}&page_size=${pageSize}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch scans')
  }

  const data = (await response.json()) as PaginatedScansResponse
  return {
    items: data.items.map(toPredictionResult),
    total: data.total,
  }
}
