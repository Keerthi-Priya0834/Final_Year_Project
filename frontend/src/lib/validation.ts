import { z } from 'zod'
import type { PatientFormDraft } from '../types'

export const patientSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  patientId: z.string().min(3, 'Enter a valid patient ID'),
  age: z
    .number({ error: 'Age is required' })
    .min(1, 'Enter a valid age')
    .max(120, 'Enter a valid age'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    error: 'Gender is required',
  }),
  eyeExamined: z.enum(['Left', 'Right', 'Both'], {
    error: 'Eye examined is required',
  }),
  scanDate: z.string().min(1, 'Scan date is required'),
})

export const imageSchema = z
  .instanceof(File, { error: 'OCT image is required' })
  .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
    error: 'Only JPEG and PNG files are supported',
  })
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    error: 'Image size must be 10MB or less',
  })

export function validatePatientField(
  field: keyof PatientFormDraft,
  value: PatientFormDraft[keyof PatientFormDraft],
) {
  if (field === 'age') {
    if (value === '') {
      return 'Age is required'
    }
    return patientSchema.shape.age.safeParse(value).success
      ? undefined
      : 'Enter a valid age'
  }

  if (field === 'gender') {
    if (value === '') {
      return 'Gender is required'
    }
    return patientSchema.shape.gender.safeParse(value).success
      ? undefined
      : 'Gender is required'
  }

  if (field === 'eyeExamined') {
    if (value === '') {
      return 'Eye examined is required'
    }
    return patientSchema.shape.eyeExamined.safeParse(value).success
      ? undefined
      : 'Eye examined is required'
  }

  if (field === 'patientName') {
    return patientSchema.shape.patientName.safeParse(value).success
      ? undefined
      : 'Name must be at least 2 characters'
  }

  if (field === 'patientId') {
    return patientSchema.shape.patientId.safeParse(value).success
      ? undefined
      : 'Enter a valid patient ID'
  }

  return patientSchema.shape.scanDate.safeParse(value).success
    ? undefined
    : 'Scan date is required'
}

export function normalizePatientDraft(values: PatientFormDraft) {
  return {
    patientName: values.patientName,
    patientId: values.patientId,
    age: values.age === '' ? undefined : values.age,
    gender: values.gender === '' ? undefined : values.gender,
    eyeExamined: values.eyeExamined === '' ? undefined : values.eyeExamined,
    scanDate: values.scanDate,
  }
}

export function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}
