'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Phone,
  UserRound,
  CalendarDays,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/calls', label: 'Calls', icon: Phone },
  { href: '/dashboard/doctors', label: 'Doctors', icon: UserRound },
  { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#002855] transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-0.5">
                <span className="text-[#002855] font-black text-base tracking-tight">KPJ</span>
              </div>
              <span className="text-white font-semibold text-sm">Damansara</span>
            </div>
            <p className="text-blue-300 text-xs mt-0.5 pl-0.5">Voice Agent Dashboard</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(href, exact)
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-blue-400 text-xs">No. 119, Jalan SS 20/10</p>
          <p className="text-blue-400 text-xs">Damansara Utama, PJ</p>
          <p className="text-blue-400 text-xs mt-1">+603-7718 1000</p>
        </div>
      </aside>
    </>
  )
}
