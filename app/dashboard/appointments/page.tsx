'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDate, getStatusColor } from '@/lib/utils'
import { DOCTORS } from '@/lib/doctors-data'
import type { Appointment } from '@/types'
import { CalendarDays, Search, Plus, X, ChevronDown, Check, UserRound, Clock } from 'lucide-react'

const STATUS_OPTIONS = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as const
type AppointmentStatus = typeof STATUS_OPTIONS[number]

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-amber-100 text-amber-700',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

interface AddAppointmentModalProps {
  onClose: () => void
  onSaved: () => void
}

function AddAppointmentModal({ onClose, onSaved }: AddAppointmentModalProps) {
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    specialty: '',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled' as AppointmentStatus,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedDoctor = DOCTORS.find(d => d.name === form.doctor_name)

  function handleDoctorChange(name: string) {
    const doc = DOCTORS.find(d => d.name === name)
    setForm(f => ({ ...f, doctor_name: name, specialty: doc?.department ?? f.specialty }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed'); return }
      onSaved()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100"
          style={{ background: 'linear-gradient(135deg, #002855 0%, #0057a8 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarDays size={15} className="text-white" />
            </div>
            <h2 className="font-bold text-white">New Appointment</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Patient Name *</label>
              <input
                required
                value={form.patient_name}
                onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50"
                placeholder="Full name"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input
                value={form.patient_phone}
                onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50"
                placeholder="+601X-XXXXXXX"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as AppointmentStatus }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Doctor *</label>
              <select
                required
                value={form.doctor_name}
                onChange={e => handleDoctorChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              >
                <option value="">Select doctor…</option>
                {DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              {selectedDoctor && (
                <p className="text-xs text-blue-500 mt-1 font-medium">{selectedDoctor.department}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date *</label>
              <input
                required type="date" value={form.appointment_date}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Time *</label>
              <input
                required type="time" value={form.appointment_time}
                onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50 resize-none"
                placeholder="Additional notes…"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #002855, #0057a8)' }}
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Check size={15} />}
              {saving ? 'Saving…' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UpdateStatusButton({ appointment, onUpdated }: { appointment: Appointment; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: AppointmentStatus) {
    setLoading(true); setOpen(false)
    await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appointment.id, status }),
    })
    setLoading(false)
    onUpdated()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors font-medium"
      >
        <ChevronDown size={11} />
        {loading ? '…' : 'Update'}
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-36">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                appointment.status === s ? 'font-bold' : 'text-slate-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[s]?.split(' ')[0]}`} />
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) setAppointments(await res.json().then((d: unknown) => Array.isArray(d) ? d : []))
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchDate = !dateFilter || a.appointment_date === dateFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      a.patient_name.toLowerCase().includes(q) ||
      a.doctor_name.toLowerCase().includes(q) ||
      a.specialty.toLowerCase().includes(q) ||
      (a.patient_phone ?? '').includes(q)
    return matchStatus && matchDate && matchSearch
  })

  const counts: Record<string, number> = { all: appointments.length }
  STATUS_OPTIONS.forEach(s => { counts[s] = appointments.filter(a => a.status === s).length })

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayCount = appointments.filter(a => a.appointment_date === todayStr).length
  const upcomingCount = appointments.filter(a => a.appointment_date >= todayStr && a.status !== 'cancelled').length

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="Appointments"
        subtitle="Patient appointment management"
        onRefresh={() => fetchAppointments(true)}
        refreshing={refreshing}
      />

      {showModal && (
        <AddAppointmentModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchAppointments(true) }}
        />
      )}

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: appointments.length, gradient: 'from-slate-400 to-slate-600', icon: CalendarDays },
            { label: 'Today', value: todayCount, gradient: 'from-sky-400 to-blue-600', icon: Clock },
            { label: 'Upcoming', value: upcomingCount, gradient: 'from-emerald-400 to-teal-500', icon: CalendarDays },
            { label: 'Confirmed', value: counts.confirmed ?? 0, gradient: 'from-violet-400 to-purple-600', icon: UserRound },
          ].map(({ label, value, gradient, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow`}>
                <Icon size={15} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, or specialty…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl whitespace-nowrap shadow-md transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #002855, #0057a8)' }}
            >
              <Plus size={15} />
              Add Appointment
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', ...STATUS_OPTIONS] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-blue-200'
                    : s === 'all'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : `${STATUS_STYLES[s] ?? 'bg-slate-100 text-slate-600'} hover:opacity-80`
                }`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <CalendarDays size={11} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <CalendarDays size={40} className="mx-auto mb-3" />
              <p className="text-sm text-slate-400">No appointments found</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-500 hover:underline font-medium">
                Add the first appointment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Patient', 'Phone', 'Doctor', 'Specialty', 'Date / Time', 'Status', ''].map(h => (
                      <th key={h} className={`text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide ${
                        h === 'Phone' ? 'hidden md:table-cell' :
                        h === 'Specialty' ? 'hidden lg:table-cell' : ''
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(appt => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{appt.patient_name}</p>
                        {appt.notes && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-36">{appt.notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-sm hidden md:table-cell">
                        {appt.patient_phone ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium text-sm">{appt.doctor_name}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{appt.specialty}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-700 font-semibold text-sm">{formatDate(appt.appointment_date)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{appt.appointment_time}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <UpdateStatusButton appointment={appt} onUpdated={() => fetchAppointments(true)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
