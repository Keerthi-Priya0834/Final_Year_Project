import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  rightSlot?: ReactNode
}

export function SectionHeader({ title, rightSlot }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="border-l-4 border-accent pl-3 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-text-secondary">
        {title}
      </h2>
      {rightSlot}
    </div>
  )
}
