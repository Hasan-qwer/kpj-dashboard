'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDate, getStatusColor } from '@/lib/utils'
import { DOCTORS } from '@/lib/doctors-data'
import type { Appointment } from '@/types'
import {
  CalendarDays,
  Search,
  Plus,
  X,
  ChevronDown,
  Check,
} from 'lucide-react'

const STATUS_OPTIONS = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as const
type AppointmentStatus = typeof STATUS_OPTIONS[number]

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(status)}`}>
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
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save appointment')
        return
      }
      onSaved()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">New Appointment</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Patient Name *</label>
              <input
                required
                value={form.patient_name}
                onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                placeholder="Full name"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input
                value={form.patient_phone}
                onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                placeholder="+601X-XXXXXXX"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as AppointmentStatus }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-white"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Doctor *</label>
              <select
                required
                value={form.doctor_name}
                onChange={e => handleDoctorChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-white"
              >
                <option value="">Select doctor…</option>
                {DOCTORS.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              {selectedDoctor && (
                <p className="text-xs text-slate-400 mt-1">{selectedDoctor.department}</p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
              <input
                required
                type="date"
                value={form.appointment_date}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Time *</label>
              <input
                required
                type="time"
                value={form.appointment_time}
                onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 resize-none"
                placeholder="Additional notes…"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-[#003366] hover:bg-[#004488] rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {saving ? 'Saving…' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface UpdateStatusProps {
  appointment: Appointment
  onUpdated: () => void
}

function UpdateStatusButton({ appointment, onUpdated }: UpdateStatusProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: AppointmentStatus) {
    setLoading(true)
    setOpen(false)
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
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded px-2 py-1 hover:bg-slate-50 transition-colors"
      >
        <ChevronDown size={12} />
        {loading ? 'Updating…' : 'Status'}
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-32">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                appointment.status === s ? 'font-semibold text-[#003366]' : 'text-slate-700'
              }`}
            >
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
      if (res.ok) {
        const data = await res.json()
        setAppointments(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
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

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Appointments"
        onRefresh={() => fetchAppointments(true)}
        refreshing={refreshing}
      />

      {showModal && (
        <AddAppointmentModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchAppointments(true) }}
        />
      )}

      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-auto">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, or specialty…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366]"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-white"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#003366] hover:bg-[#004488] rounded-lg transition-colors whitespace-nowrap"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#003366] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No appointments found</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-sm text-[#003366] hover:underline"
              >
                Add the first appointment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Doctor</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Specialty</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date / Time</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(appt => (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{appt.patient_name}</p>
                        {appt.notes && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-32">{appt.notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 hidden md:table-cell">
                        {appt.patient_phone ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{appt.doctor_name}</td>
                      <td className="px-5 py-3 text-slate-500 hidden lg:table-cell text-xs">{appt.specialty}</td>
                      <td className="px-5 py-3">
                        <p className="text-slate-700 font-medium">{formatDate(appt.appointment_date)}</p>
                        <p className="text-xs text-slate-400">{appt.appointment_time}</p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-5 py-3">
                        <UpdateStatusButton
                          appointment={appt}
                          onUpdated={() => fetchAppointments(true)}
                        />
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
