import { ImagePlus, X } from 'lucide-react'
import { useRef } from 'react'
import { formatSize } from '../lib/utils'

type ImageDropzoneProps = {
  file: File | null
  previewUrl: string | null
  error?: string
  touched?: boolean
  onSelect: (file: File | null) => void
  onBlur: () => void
}

export function ImageDropzone({
  file,
  previewUrl,
  error,
  touched,
  onSelect,
  onBlur,
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || !incoming.length) {
      return
    }

    onSelect(incoming[0])
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onBlur={onBlur}
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          handleFiles(event.dataTransfer.files)
          onBlur()
        }}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="relative grid min-h-[220px] place-items-center rounded-xl border border-dashed border-field-border bg-field/70 p-5 outline-none transition-colors hover:border-accent/60 focus:border-accent"
      >
        {file && previewUrl ? (
          <div className="w-full">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelect(null)
              }}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-bg/70 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
            <div className="h-[180px] overflow-hidden rounded-lg border border-field-border bg-bg/50">
              <img
                src={previewUrl}
                alt="OCT preview"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-3 font-mono text-xs text-text-secondary">
              {file.name} · {formatSize(file.size)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <ImagePlus className="mx-auto mb-3 h-8 w-8 text-accent" />
            <p className="text-base text-text-primary">Drag & drop your OCT scan here</p>
            <p className="mt-1 text-sm text-text-secondary">or click to browse</p>
            <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.13em] text-text-secondary">
              Accepted formats: JPEG, PNG · Max size: 10MB
            </p>
          </div>
        )}
      </div>

      <p
        className={`mt-2 min-h-5 text-xs text-danger transition-opacity duration-200 ${
          touched && error ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {touched && error ? error : ' '}
      </p>
    </div>
  )
}
