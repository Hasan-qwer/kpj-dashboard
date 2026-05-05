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
    color: 'from-sky-400 to-blue-500',
    glow: 'shadow-blue-500/40',
  },
  {
    href: '/dashboard/calls',
    label: 'Calls',
    icon: Phone,
    color: 'from-violet-400 to-purple-600',
    glow: 'shadow-purple-500/40',
  },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    icon: CalendarDays,
    color: 'from-pink-400 to-rose-500',
    glow: 'shadow-rose-500/40',
  },
  {
    href: '/dashboard/doctors',
    label: 'Doctors',
    icon: UserRound,
    color: 'from-emerald-400 to-teal-500',
    glow: 'shadow-teal-500/40',
  },
  {
    href: '/dashboard/schedules',
    label: 'Schedules',
    icon: CalendarClock,
    color: 'from-amber-400 to-orange-500',
    glow: 'shadow-orange-500/40',
  },
  {
    href: '/dashboard/status',
    label: 'Status',
    icon: Activity,
    color: 'from-red-400 to-rose-600',
    glow: 'shadow-rose-500/40',
  },
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
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-72 flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0f2548 70%, #112d5a 100%)',
        }}
      >
        {/* Top glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

        {/* Logo area */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* KPJ badge */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
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
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, color, glow }) => {
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
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                  active
                    ? `bg-gradient-to-br ${color} shadow-md ${glow}`
                    : `bg-white/5 group-hover:bg-gradient-to-br group-hover:${color} group-hover:shadow-md group-hover:${glow}`
                )}>
                  <Icon size={15} className="text-white" />
                </div>

                <span className="flex-1">{label}</span>

                {/* Active indicator */}
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

        <div className="px-6 pb-6 space-y-3">
          {/* Hospital info */}
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-blue-300 text-xs font-semibold mb-1">KPJ Damansara Specialist</p>
            <p className="text-blue-400/60 text-[11px] leading-relaxed">
              No. 119, Jalan SS 20/10<br />
              Damansara Utama, 47400 PJ<br />
              <span className="text-sky-400">+603-7718 1000</span>
            </p>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-400 text-xs font-medium">Agent Online</span>
          </div>
        </div>
      </aside>
    </>
  )
}
