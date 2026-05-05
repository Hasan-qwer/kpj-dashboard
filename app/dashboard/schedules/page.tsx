'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { getStatusColor } from '@/lib/utils'
import type { Appointment } from '@/types'
import { CalendarClock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const STATUS_DOT: Record<string, string> = {
  pending:   'bg-blue-400',
  confirmed: 'bg-emerald-400',
  completed: 'bg-slate-400',
  cancelled: 'bg-red-400',
  no_show:   'bg-amber-400',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function SchedulesPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10))

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) setAppointments(await res.json().then((d: unknown) => Array.isArray(d) ? d : []))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Group appointments by date
  const byDate: Record<string, Appointment[]> = {}
  appointments.forEach(a => {
    if (!byDate[a.appointment_date]) byDate[a.appointment_date] = []
    byDate[a.appointment_date].push(a)
  })

  const selectedAppts = byDate[selectedDate] ?? []

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="Schedules"
        subtitle="Doctor appointment calendar"
        onRefresh={() => fetchAppointments(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100"
              style={{ background: 'linear-gradient(135deg, #002855 0%, #0057a8 100%)' }}
            >
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{MONTH_NAMES[viewMonth]} {viewYear}</p>
                <p className="text-blue-200 text-xs mt-0.5">{appointments.length} total appointments</p>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-b border-r border-slate-50 min-h-[80px] bg-slate-50/50" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayAppts = byDate[dateStr] ?? []
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`border-b border-r border-slate-100 min-h-[80px] p-2 cursor-pointer transition-all hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold mb-1 ${
                        isToday
                          ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-blue-200'
                          : isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600'
                      }`}>
                        {day}
                      </div>

                      {/* Appointment dots */}
                      <div className="space-y-0.5">
                        {dayAppts.slice(0, 3).map((appt, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate ${
                              appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              appt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              appt.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                              appt.status === 'no_show' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[appt.status] ?? 'bg-slate-400'}`} />
                            <span className="truncate">{appt.customer_name.split(' ')[0]}</span>
                          </div>
                        ))}
                        {dayAppts.length > 3 && (
                          <p className="text-[10px] text-slate-400 px-1">+{dayAppts.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Day panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}>
                <CalendarClock size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-MY', {
                    weekday: 'long', day: 'numeric', month: 'short',
                  })}
                </p>
                <p className="text-xs text-slate-400">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <CalendarDays size={36} className="mb-3" />
                  <p className="text-sm text-slate-400">No appointments</p>
                  <p className="text-xs text-slate-300 mt-1">for this date</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {selectedAppts
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map(appt => (
                      <div key={appt.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{appt.customer_name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{appt.customer_phone ?? 'No phone'}</p>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${getStatusColor(appt.status)}`}>
                            {appt.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)' }}
                            >
                              <CalendarClock size={9} className="text-white" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{appt.appointment_time}</span>
                          </div>
                          <p className="text-xs text-slate-500 ml-6">{appt.reason}</p>
                          {appt.notes && (
                            <p className="text-xs text-slate-400 ml-6 italic mt-1">{appt.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
