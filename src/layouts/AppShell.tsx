import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function AppShell() {
  const { pathname } = useLocation()
  const hideNav =
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/market/') ||
    pathname.startsWith('/discover/') ||
    pathname === '/saved' ||
    pathname === '/wishlist' ||
    pathname.startsWith('/chat')

  return (
    <div className="min-h-[100dvh] bg-moss-900 sm:flex sm:items-center sm:justify-center sm:p-8">
      <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-sand-50 sm:h-[880px] sm:max-w-[420px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-moss-900 sm:shadow-2xl">
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  )
}
