import { ChevronDown } from 'lucide-react'
import type { PatientFormDraft } from '../types'

export type FieldErrors = Partial<Record<keyof PatientFormDraft, string>>
export type TouchedFields = Partial<Record<keyof PatientFormDraft, boolean>>

type PatientFormProps = {
  values: PatientFormDraft
  onChange: <K extends keyof PatientFormDraft>(
    key: K,
    value: PatientFormDraft[K],
  ) => void
  onBlur: (field: keyof PatientFormDraft) => void
  errors: FieldErrors
  touched: TouchedFields
}

const inputClassName =
  'w-full rounded-lg border border-field-border bg-field px-4 py-3 text-sm text-text-primary outline-none focus:border-accent'

function FieldError({ message }: { message?: string }) {
  return (
    <p
      className={`mt-1 min-h-5 text-xs text-danger transition-opacity duration-200 ${
        message ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      {message ?? ' '}
    </p>
  )
}

function FieldLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary"
    >
      {label}
    </label>
  )
}

export function PatientForm({
  values,
  onChange,
  onBlur,
  errors,
  touched,
}: PatientFormProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <div>
        <FieldLabel htmlFor="patientName" label="Patient Name" />
        <input
          id="patientName"
          value={values.patientName}
          onChange={(event) => onChange('patientName', event.target.value)}
          onBlur={() => onBlur('patientName')}
          className={inputClassName}
          placeholder="e.g. Ravi Kumar"
        />
        <FieldError message={touched.patientName ? errors.patientName : undefined} />
      </div>

      <div>
        <FieldLabel htmlFor="patientId" label="Patient ID" />
        <input
          id="patientId"
          value={values.patientId}
          onChange={(event) => onChange('patientId', event.target.value)}
          onBlur={() => onBlur('patientId')}
          className={inputClassName}
          placeholder="e.g. PT-2024-001"
        />
        <FieldError message={touched.patientId ? errors.patientId : undefined} />
      </div>

      <div>
        <FieldLabel htmlFor="age" label="Age" />
        <input
          id="age"
          type="number"
          min={1}
          max={120}
          value={values.age || ''}
          onChange={(event) =>
            onChange('age', event.target.value ? Number(event.target.value) : '')
          }
          onBlur={() => onBlur('age')}
          className={inputClassName}
          placeholder="e.g. 65"
        />
        <FieldError message={touched.age ? errors.age : undefined} />
      </div>

      <div>
        <FieldLabel htmlFor="gender" label="Gender" />
        <div className="relative">
          <select
            id="gender"
            value={values.gender ?? ''}
            onChange={(event) =>
              onChange('gender', event.target.value as PatientFormDraft['gender'])
            }
            onBlur={() => onBlur('gender')}
            className={`${inputClassName} appearance-none pr-10`}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
        <FieldError message={touched.gender ? errors.gender : undefined} />
      </div>

      <div>
        <FieldLabel htmlFor="eyeExamined" label="Eye Examined" />
        <div className="relative">
          <select
            id="eyeExamined"
            value={values.eyeExamined ?? ''}
            onChange={(event) =>
              onChange(
                'eyeExamined',
                event.target.value as PatientFormDraft['eyeExamined'],
              )
            }
            onBlur={() => onBlur('eyeExamined')}
            className={`${inputClassName} appearance-none pr-10`}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="Left">Left Eye</option>
            <option value="Right">Right Eye</option>
            <option value="Both">Both Eyes</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
        <FieldError
          message={touched.eyeExamined ? errors.eyeExamined : undefined}
        />
      </div>

      <div>
        <FieldLabel htmlFor="scanDate" label="Scan Date" />
        <input
          id="scanDate"
          type="date"
          value={values.scanDate}
          onChange={(event) => onChange('scanDate', event.target.value)}
          onBlur={() => onBlur('scanDate')}
          className={`${inputClassName} [color-scheme:dark]`}
        />
        <FieldError message={touched.scanDate ? errors.scanDate : undefined} />
      </div>
    </div>
  )
}
