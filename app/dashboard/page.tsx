'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDuration, formatTimestamp, getStatusColor } from '@/lib/utils'
import { G, CARD_BG, CARD_TEXT, CARD_SUB, CARD_BORDER } from '@/lib/colors'
import { DOCTORS } from '@/lib/doctors-data'
import type { RetellCall, Appointment } from '@/types'
import {
  Phone, UserRound, CalendarDays, Clock,
  TrendingUp, Activity, CheckCircle2, AlertCircle,
  ArrowUpRight, Mic,
} from 'lucide-react'

const STAT_CARDS = [
  { key: 'callsToday',  label: 'Calls Today',     icon: Phone,         color: 'blue'    },
  { key: 'totalCalls',  label: 'Total Calls',      icon: TrendingUp,    color: 'purple'  },
  { key: 'avgDuration', label: 'Avg Duration',     icon: Clock,         color: 'emerald' },
  { key: 'doctors',     label: 'Doctors',          icon: UserRound,     color: 'amber'   },
  { key: 'todayAppts',  label: "Today's Appts",    icon: CalendarDays,  color: 'rose'    },
  { key: 'upcoming',    label: 'Upcoming',         icon: Activity,      color: 'cyan'    },
  { key: 'completed',   label: 'Completed',        icon: CheckCircle2,  color: 'green'   },
  { key: 'cancelled',   label: 'Cancelled',        icon: AlertCircle,   color: 'red'     },
] as const

type StatKey = typeof STAT_CARDS[number]['color']

export default function DashboardPage() {
  const [calls, setCalls] = useState<RetellCall[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [callsRes, apptRes] = await Promise.all([
        fetch('/api/calls?limit=200'),
        fetch('/api/appointments'),
      ])
      if (callsRes.ok) setCalls(await callsRes.json().then((d: unknown) => Array.isArray(d) ? d : []))
      if (apptRes.ok) setAppointments(await apptRes.json().then((d: unknown) => Array.isArray(d) ? d : []))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayTs = todayStart.getTime()
  const todayCalls = calls.filter(c => (c.start_timestamp ?? 0) >= todayTs)
  const ongoingCalls = calls.filter(c => c.call_status === 'ongoing')
  const endedCalls = calls.filter(c => c.call_status === 'ended' && c.duration_ms)
  const avgDuration = endedCalls.length
    ? Math.round(endedCalls.reduce((s, c) => s + (c.duration_ms ?? 0), 0) / endedCalls.length)
    : 0
  const todayDateStr = todayStart.toISOString().slice(0, 10)
  const todayAppts = appointments.filter(a => a.appointment_date === todayDateStr)
  const upcomingAppts = appointments.filter(a =>
    a.appointment_date >= todayDateStr && a.status !== 'cancelled' && a.status !== 'completed'
  )

  const statValues: Record<string, { value: string | number; sub: string }> = {
    callsToday:  { value: todayCalls.length, sub: `${ongoingCalls.length} ongoing` },
    totalCalls:  { value: calls.length, sub: 'All time' },
    avgDuration: { value: formatDuration(avgDuration), sub: 'Per ended call' },
    doctors:     { value: DOCTORS.length, sub: '45+ specialties' },
    todayAppts:  { value: todayAppts.length, sub: 'Scheduled today' },
    upcoming:    { value: upcomingAppts.length, sub: 'Scheduled / confirmed' },
    completed:   { value: appointments.filter(a => a.status === 'completed').length, sub: 'All time' },
    cancelled:   { value: appointments.filter(a => a.status === 'cancelled').length, sub: 'All time' },
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="Overview"
        subtitle="KPJ Damansara Voice Agent Dashboard"
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Hero banner */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #002855 0%, #004a9c 50%, #0066cc 100%)' }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 right-20 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-4 right-36 w-16 h-16 rounded-full bg-sky-400/20" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">System Active</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-blue-200 text-sm mt-1">
                {new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
                <p className="text-2xl font-bold">{ongoingCalls.length}</p>
                <p className="text-blue-200 text-xs mt-0.5">Live Calls</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
                <p className="text-2xl font-bold">{todayCalls.length}</p>
                <p className="text-blue-200 text-xs mt-0.5">Today</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
                <p className="text-2xl font-bold">{upcomingAppts.length}</p>
                <p className="text-blue-200 text-xs mt-0.5">Upcoming Appts</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map(({ key, label, icon: Icon, color }) => {
                const stat = statValues[key]
                return (
                  <div
                    key={key}
                    className="relative rounded-2xl border p-5 overflow-hidden group hover:shadow-md transition-all duration-200"
                    style={{
                      ...CARD_BG[color],
                      borderColor: CARD_BORDER[color],
                    }}
                  >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/40 group-hover:scale-110 transition-transform duration-300" />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md"
                      style={G[color]}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: CARD_TEXT[color] }}>{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: CARD_SUB[color] }}>{stat.sub}</p>
                  </div>
                )
              })}
            </div>

            {/* Two-column bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Calls */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={G.purple}
                    >
                      <Phone size={13} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-slate-800 text-sm">Recent Calls</h2>
                  </div>
                  <a
                    href="/dashboard/calls"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all <ArrowUpRight size={12} />
                  </a>
                </div>

                {calls.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No calls recorded yet.</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {calls.slice(0, 6).map(call => (
                      <div key={call.call_id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          call.call_status === 'ongoing' ? 'bg-emerald-100' :
                          call.call_status === 'error' ? 'bg-red-100' : 'bg-slate-100'
                        }`}>
                          <Mic size={13} className={
                            call.call_status === 'ongoing' ? 'text-emerald-600' :
                            call.call_status === 'error' ? 'text-red-500' : 'text-slate-400'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {call.from_number ?? 'Unknown caller'}
                          </p>
                          <p className="text-xs text-slate-400">{formatTimestamp(call.start_timestamp)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400">{formatDuration(call.duration_ms)}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${getStatusColor(call.call_status)}`}>
                            {call.call_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={G.rose}
                    >
                      <CalendarDays size={13} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-slate-800 text-sm">Upcoming Appointments</h2>
                  </div>
                  <a
                    href="/dashboard/appointments"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all <ArrowUpRight size={12} />
                  </a>
                </div>

                {upcomingAppts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">No upcoming appointments.</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {upcomingAppts.slice(0, 6).map(appt => (
                      <div key={appt.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                          <CalendarDays size={13} className="text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{appt.patient_name}</p>
                          <p className="text-xs text-slate-400 truncate">{appt.doctor_name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-slate-600">{appt.appointment_date}</p>
                          <p className="text-xs text-slate-400">{appt.appointment_time}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
