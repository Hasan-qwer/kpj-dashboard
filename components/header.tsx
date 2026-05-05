'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/components/sidebar-context'
import { Menu, RefreshCw, LogOut, Bell, ArrowLeft, Home, Phone, CalendarDays, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { formatTimestamp } from '@/lib/utils'
import type { RetellCall, Appointment } from '@/types'

interface HeaderProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export function Header({ title, subtitle, onRefresh, refreshing }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const [signingOut, setSigningOut] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [recentCalls, setRecentCalls] = useState<RetellCall[]>([])
  const [upcomingAppts, setUpcomingAppts] = useState<Appointment[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const isHome = pathname === '/dashboard'

  const fetchNotifs = useCallback(async () => {
    setNotifLoading(true)
    try {
      const [callsRes, apptRes] = await Promise.all([
        fetch('/api/calls?limit=20'),
        fetch('/api/appointments'),
      ])
      if (callsRes.ok) {
        const data = await callsRes.json()
        setRecentCalls(Array.isArray(data) ? data.slice(0, 5) : [])
      }
      if (apptRes.ok) {
        const data = await apptRes.json()
        const today = new Date().toISOString().slice(0, 10)
        setUpcomingAppts(
          Array.isArray(data)
            ? data.filter((a: Appointment) => a.appointment_date >= today && a.status !== 'cancelled').slice(0, 5)
            : []
        )
      }
    } finally {
      setNotifLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  async function handleLogout() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const hasNotifs = recentCalls.length > 0 || upcomingAppts.length > 0

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile menu toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Back button — not shown on home */}
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Home button — not shown on home */}
        {!isHome && (
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
            aria-label="Dashboard home"
          >
            <Home size={18} />
          </Link>
        )}

        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative hidden sm:block" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {hasNotifs && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">Notifications</p>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {notifLoading ? (
                <div className="py-10 text-center">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {/* Recent Calls section */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recent Calls</p>
                  </div>
                  {recentCalls.length === 0 ? (
                    <p className="text-xs text-slate-400 px-4 py-3 italic">No recent calls</p>
                  ) : recentCalls.map(call => (
                    <div key={call.call_id} className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        call.call_status === 'ongoing' ? 'bg-emerald-100' :
                        call.call_status === 'error' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        <Phone size={12} className={
                          call.call_status === 'ongoing' ? 'text-emerald-600' :
                          call.call_status === 'error' ? 'text-red-500' : 'text-slate-400'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {call.from_number ?? 'Unknown caller'}
                        </p>
                        <p className="text-[11px] text-slate-400">{formatTimestamp(call.start_timestamp)}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                        call.call_status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                        call.call_status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {call.call_status}
                      </span>
                    </div>
                  ))}

                  {/* Upcoming Appointments section */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Upcoming Appointments</p>
                  </div>
                  {upcomingAppts.length === 0 ? (
                    <p className="text-xs text-slate-400 px-4 py-3 italic">No upcoming appointments</p>
                  ) : upcomingAppts.map(appt => (
                    <div key={appt.id} className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                        <CalendarDays size={12} className="text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{appt.patient_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {appt.doctor_name} · {appt.appointment_date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-slate-100 flex gap-3">
                <Link
                  href="/dashboard/calls"
                  onClick={() => setNotifOpen(false)}
                  className="flex-1 text-center text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors py-1"
                >
                  All Calls
                </Link>
                <div className="w-px bg-slate-200" />
                <Link
                  href="/dashboard/appointments"
                  onClick={() => setNotifOpen(false)}
                  className="flex-1 text-center text-xs text-rose-600 font-semibold hover:text-rose-800 transition-colors py-1"
                >
                  All Appointments
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #003366, #0057a8)' }}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline text-xs">{signingOut ? 'Signing out…' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
