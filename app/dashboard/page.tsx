'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDuration, formatTimestamp, getStatusColor } from '@/lib/utils'
import { DOCTORS } from '@/lib/doctors-data'
import type { RetellCall, Appointment } from '@/types'
import {
  Phone,
  UserRound,
  CalendarDays,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4">
      <div className={`${color} p-3 rounded-lg shrink-0`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

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
      if (callsRes.ok) {
        const data = await callsRes.json()
        setCalls(Array.isArray(data) ? data : [])
      }
      if (apptRes.ok) {
        const data = await apptRes.json()
        setAppointments(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Derived stats
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayTs = todayStart.getTime()
  const todayCalls = calls.filter(c => (c.start_timestamp ?? 0) >= todayTs)
  const ongoingCalls = calls.filter(c => c.call_status === 'ongoing')
  const endedCalls = calls.filter(c => c.call_status === 'ended' && c.duration_ms)
  const avgDuration = endedCalls.length
    ? Math.round(endedCalls.reduce((sum, c) => sum + (c.duration_ms ?? 0), 0) / endedCalls.length)
    : 0

  const todayDateStr = todayStart.toISOString().slice(0, 10)
  const todayAppts = appointments.filter(a => a.appointment_date === todayDateStr)
  const upcomingAppts = appointments.filter(a =>
    a.appointment_date >= todayDateStr && a.status !== 'cancelled' && a.status !== 'completed'
  )

  const recentCalls = calls.slice(0, 6)

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Overview"
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Calls Today"
                value={todayCalls.length}
                sub={`${ongoingCalls.length} ongoing`}
                icon={<Phone size={20} className="text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                label="Total Calls"
                value={calls.length}
                sub="All time"
                icon={<TrendingUp size={20} className="text-indigo-600" />}
                color="bg-indigo-50"
              />
              <StatCard
                label="Avg Duration"
                value={formatDuration(avgDuration)}
                sub="Ended calls"
                icon={<Clock size={20} className="text-emerald-600" />}
                color="bg-emerald-50"
              />
              <StatCard
                label="Doctors"
                value={DOCTORS.length}
                sub="45+ specialties"
                icon={<UserRound size={20} className="text-violet-600" />}
                color="bg-violet-50"
              />
              <StatCard
                label="Today's Appointments"
                value={todayAppts.length}
                icon={<CalendarDays size={20} className="text-amber-600" />}
                color="bg-amber-50"
              />
              <StatCard
                label="Upcoming"
                value={upcomingAppts.length}
                sub="Scheduled / confirmed"
                icon={<Activity size={20} className="text-cyan-600" />}
                color="bg-cyan-50"
              />
              <StatCard
                label="Completed"
                value={appointments.filter(a => a.status === 'completed').length}
                sub="All time"
                icon={<CheckCircle2 size={20} className="text-green-600" />}
                color="bg-green-50"
              />
              <StatCard
                label="Cancelled"
                value={appointments.filter(a => a.status === 'cancelled').length}
                sub="All time"
                icon={<AlertCircle size={20} className="text-red-500" />}
                color="bg-red-50"
              />
            </div>

            {/* Recent Calls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Recent Calls</h2>
                <a href="/dashboard/calls" className="text-sm text-[#003366] hover:underline font-medium">
                  View all →
                </a>
              </div>
              {recentCalls.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">No calls recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentCalls.map(call => (
                    <div key={call.call_id} className="px-5 py-3 flex items-center gap-4">
                      <div className="shrink-0">
                        <Phone size={16} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">
                          {call.from_number ?? call.call_id.slice(0, 16) + '…'}
                        </p>
                        <p className="text-xs text-slate-400">{formatTimestamp(call.start_timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500">{formatDuration(call.duration_ms)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(call.call_status)}`}>
                          {call.call_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
                <a href="/dashboard/appointments" className="text-sm text-[#003366] hover:underline font-medium">
                  View all →
                </a>
              </div>
              {upcomingAppts.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">No upcoming appointments.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {upcomingAppts.slice(0, 6).map(appt => (
                    <div key={appt.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="shrink-0">
                        <CalendarDays size={16} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">{appt.patient_name}</p>
                        <p className="text-xs text-slate-400">{appt.doctor_name} · {appt.specialty}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-xs text-slate-600 font-medium">{appt.appointment_date}</p>
                          <p className="text-xs text-slate-400">{appt.appointment_time}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
