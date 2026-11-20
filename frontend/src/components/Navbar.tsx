import { Link, useRouterState } from '@tanstack/react-router'
import { Eye } from 'lucide-react'

const navLinkClass =
  'relative font-mono text-xs uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary'

export function Navbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-field-border/80 bg-bg/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="relative">
            <Eye className="h-5 w-5 text-text-primary" strokeWidth={2.2} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
          </span>
          <div>
            <p className="font-sans text-base font-semibold tracking-wide text-text-primary">
              EyeQ
            </p>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-text-secondary">
              OCT-Based AMD Detection
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Link to="/" className={navLinkClass}>
              New Scan
            </Link>
            {pathname === '/' ? (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-accent" />
            ) : null}
          </div>

          <div className="relative">
            <Link to="/history" className={navLinkClass}>
              History
            </Link>
            {pathname === '/history' ? (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-accent" />
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  )
}
