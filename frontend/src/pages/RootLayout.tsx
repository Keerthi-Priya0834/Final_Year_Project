import { Outlet, useRouterState } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'

export function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div className="min-h-dvh bg-bg text-text-primary">
      <Navbar />
      <main key={pathname} className="animate-page-enter px-4 pb-10 pt-24 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
