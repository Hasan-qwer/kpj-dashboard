'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Phone,
  UserRound,
  CalendarDays,
  CalendarClock,
  Activity,
  X,
  Stethoscope,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
    bg: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
  },
  {
    href: '/dashboard/calls',
    label: 'Calls',
    icon: Phone,
    bg: 'linear-gradient(135deg, #a78bfa 0%, #9333ea 100%)',
  },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    icon: CalendarDays,
    bg: 'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
  },
  {
    href: '/dashboard/doctors',
    label: 'Doctors',
    icon: UserRound,
    bg: 'linear-gradient(135deg, #34d399 0%, #14b8a6 100%)',
  },
  {
    href: '/dashboard/schedules',
    label: 'Schedules',
    icon: CalendarClock,
    bg: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
  },
  {
    href: '/dashboard/status',
    label: 'Status',
    icon: Activity,
    bg: 'linear-gradient(135deg, #f87171 0%, #e11d48 100%)',
  },
]

const SIDEBAR_BG = 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0f2548 70%, #112d5a 100%)'

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
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — desktop: always visible in flow; mobile: overlay when open */}
      <aside
        className={cn(
          'flex flex-col w-72 shrink-0 z-30',
          open ? 'fixed inset-y-0 left-0' : 'max-lg:hidden'
        )}
        style={{ background: SIDEBAR_BG }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

        {/* Logo area */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' }}
                >
                  <Stethoscope size={18} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a1628] animate-pulse" />
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">KPJ Damansara</p>
                <p className="text-blue-400 text-[11px] font-medium tracking-wider uppercase">Voice Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

        {/* Nav label */}
        <p className="px-6 text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2">
          Navigation
        </p>

        {/* Nav items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, bg }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                )}
              >
                {/* Colored icon badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{ background: active ? bg : 'rgba(255,255,255,0.06)' }}
                >
                  <Icon size={15} className="text-white" />
                </div>

                <span className="flex-1">{label}</span>

                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 mt-4" />

        <div className="px-6 pb-6 space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-blue-300 text-xs font-semibold mb-1">KPJ Damansara Specialist</p>
            <p className="text-blue-400/60 text-[11px] leading-relaxed">
              No. 119, Jalan SS 20/10<br />
              Damansara Utama, 47400 PJ<br />
              <span className="text-sky-400">+603-7718 1000</span>
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-400 text-xs font-medium">Agent Online</span>
          </div>
        </div>
      </aside>
    </>
  )
}
