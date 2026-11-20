import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ScanLine } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { ImageDropzone } from '../components/ImageDropzone'
import { PatientForm, type FieldErrors, type TouchedFields } from '../components/PatientForm'
import { SectionHeader } from '../components/SectionHeader'
import { createScan } from '../lib/api'
import {
  imageSchema,
  normalizePatientDraft,
  patientSchema,
  todayDateInputValue,
  validatePatientField,
} from '../lib/validation'
import { useAppStore } from '../store/useAppStore'
import type { PatientFormDraft } from '../types'

const defaultValues: PatientFormDraft = {
  patientName: '',
  patientId: '',
  age: '',
  gender: '',
  eyeExamined: '',
  scanDate: todayDateInputValue(),
}

export function NewScanPage() {
  const navigate = useNavigate()
  const setPatient = useAppStore((state) => state.setPatient)
  const setImage = useAppStore((state) => state.setImage)
  const setResult = useAppStore((state) => state.setResult)
  const addToHistory = useAppStore((state) => state.addToHistory)

  const [values, setValues] = useState<PatientFormDraft>(defaultValues)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({})
  const [imageTouched, setImageTouched] = useState(false)
  const [imageError, setImageError] = useState<string>()

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  )

  const mutation = useMutation({
    mutationFn: async () => {
      const patient = patientSchema.parse(normalizePatientDraft(values))
      const image = imageSchema.parse(imageFile)
      return createScan(patient, image)
    },
    onSuccess: (result) => {
      setPatient({
        ...values,
        age: result.age,
        gender: result.gender,
        eyeExamined: result.eyeExamined,
      })
      setImage(imageFile)
      setResult(result)
      addToHistory(result)
      navigate({ to: '/results' })
    },
  })

  const validateField = (field: keyof PatientFormDraft) => {
    const message = validatePatientField(field, values[field])
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }

  const validateImage = () => {
    const parsed = imageSchema.safeParse(imageFile)
    setImageError(parsed.success ? undefined : parsed.error.issues[0]?.message)
    return parsed.success
  }

  const validateAll = () => {
    const patientParsed = patientSchema.safeParse(normalizePatientDraft(values))

    if (!patientParsed.success) {
      const nextErrors: FieldErrors = {}
      patientParsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof PatientFormDraft
        nextErrors[key] = issue.message
      })
      setErrors(nextErrors)
      setTouched({
        patientName: true,
        patientId: true,
        age: true,
        gender: true,
        eyeExamined: true,
        scanDate: true,
      })
    }

    setImageTouched(true)
    const imageValid = validateImage()

    return patientParsed.success && imageValid
  }

  const canSubmit =
    patientSchema.safeParse(normalizePatientDraft(values)).success &&
    imageSchema.safeParse(imageFile).success

  useEffect(() => {
    if (!previewUrl) {
      return
    }

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  return (
    <div className="mx-auto w-full max-w-[860px] space-y-6">
      <section className="rounded-xl border border-field-border bg-surface p-5 sm:p-6">
        <SectionHeader title="Patient Information" />
        <PatientForm
          values={values}
          onChange={(key, value) => {
            setValues((prev) => ({ ...prev, [key]: value }))
          }}
          onBlur={(field) => {
            setTouched((prev) => ({ ...prev, [field]: true }))
            validateField(field)
          }}
          errors={errors}
          touched={touched}
        />
      </section>

      <section className="rounded-xl border border-field-border bg-surface p-5 sm:p-6">
        <SectionHeader title="OCT Image Upload" />
        <ImageDropzone
          file={imageFile}
          previewUrl={previewUrl}
          onSelect={(file) => {
            setImageFile(file)
            if (imageTouched) {
              setImageError(undefined)
              validateImage()
            }
          }}
          onBlur={() => {
            setImageTouched(true)
            validateImage()
          }}
          touched={imageTouched}
          error={imageError}
        />
      </section>

      <button
        type="button"
        disabled={!canSubmit || mutation.isPending}
        onClick={() => {
          if (!validateAll()) {
            return
          }

          mutation.mutate()
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.97]"
      >
        {mutation.isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
            Analyzing OCT Scan...
          </>
        ) : (
          <>
            <ScanLine className="h-5 w-5" />
            Run Analysis
          </>
        )}
      </button>

      {mutation.error instanceof z.ZodError ? null : mutation.error ? (
        <p className="text-sm text-danger">Analysis failed. Please try again.</p>
      ) : null}
    </div>
  )
}
