'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDuration, formatTimestamp, getStatusColor } from '@/lib/utils'
import type { RetellCall } from '@/types'
import { Phone, ChevronDown, ChevronUp, Search, Mic, MicOff, PhoneIncoming } from 'lucide-react'

function TranscriptViewer({ call }: { call: RetellCall }) {
  const [detail, setDetail] = useState<RetellCall | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!call.transcript_object && !call.transcript) {
      setLoading(true)
      fetch(`/api/calls/${call.call_id}`)
        .then(r => r.json())
        .then(d => setDetail(d))
        .finally(() => setLoading(false))
    } else {
      setDetail(call)
    }
  }, [call])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const segments = detail?.transcript_object
  const plainText = detail?.transcript

  if (segments && segments.length > 0) {
    return (
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {segments.map((seg, i) => (
          <div key={i} className={`flex gap-3 ${seg.role === 'agent' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              seg.role === 'agent'
                ? 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-md'
                : 'bg-gradient-to-br from-slate-200 to-slate-300'
            }`}>
              {seg.role === 'agent'
                ? <Mic size={12} className="text-white" />
                : <MicOff size={12} className="text-slate-500" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
              seg.role === 'agent'
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tl-none shadow-md shadow-blue-200'
                : 'bg-white text-slate-700 rounded-tr-none border border-slate-200 shadow-sm'
            }`}>
              <p className="text-[10px] opacity-60 mb-0.5 font-bold uppercase tracking-wide">
                {seg.role === 'agent' ? 'Agent' : 'Caller'}
              </p>
              {seg.content}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (plainText) {
    return (
      <div className="max-h-72 overflow-y-auto bg-slate-50 rounded-xl p-4">
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{plainText}</pre>
      </div>
    )
  }

  return <p className="text-sm text-slate-400 italic py-2">No transcript available for this call.</p>
}

function CallRow({ call }: { call: RetellCall }) {
  const [expanded, setExpanded] = useState(false)

  const statusStyle = {
    ongoing: 'bg-emerald-100 text-emerald-700',
    ended: 'bg-slate-100 text-slate-600',
    error: 'bg-red-100 text-red-600',
    registered: 'bg-blue-100 text-blue-700',
  }[call.call_status] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className={`border-b border-slate-100 last:border-0 transition-colors ${expanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left"
      >
        {/* Status dot */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          call.call_status === 'ongoing' ? 'bg-emerald-100' :
          call.call_status === 'error' ? 'bg-red-100' : 'bg-slate-100'
        }`}>
          <PhoneIncoming size={15} className={
            call.call_status === 'ongoing' ? 'text-emerald-600' :
            call.call_status === 'error' ? 'text-red-500' : 'text-slate-400'
          } />
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {call.from_number ?? 'Unknown caller'}
            </p>
            <p className="text-xs text-slate-400 font-mono truncate">{call.call_id.slice(0, 20)}…</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-slate-600">{formatTimestamp(call.start_timestamp)}</p>
            <p className="text-xs text-slate-400">{call.disconnection_reason ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">{formatDuration(call.duration_ms)}</span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${statusStyle}`}>
              {call.call_status}
            </span>
          </div>
        </div>

        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          expanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
        }`}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 bg-white border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4">
            {[
              { label: 'Call ID', value: call.call_id, mono: true },
              { label: 'Type', value: call.call_type ?? '—' },
              { label: 'Started', value: formatTimestamp(call.start_timestamp) },
              { label: 'Ended', value: formatTimestamp(call.end_timestamp) },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-xs text-slate-700 break-all ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
              </div>
            ))}
          </div>

          {call.recording_url && (
            <div className="mb-4 bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2">Recording</p>
              <audio controls src={call.recording_url} className="w-full h-10 rounded" />
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-3">Transcript</p>
            <TranscriptViewer call={call} />
          </div>
        </div>
      )}
    </div>
  )
}

const STATUS_FILTERS = ['all', 'ongoing', 'ended', 'error', 'registered'] as const

export default function CallsPage() {
  const [calls, setCalls] = useState<RetellCall[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchCalls = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/calls?limit=200')
      if (res.ok) setCalls(await res.json().then((d: unknown) => Array.isArray(d) ? d : []))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const filtered = calls.filter(c => {
    const matchStatus = statusFilter === 'all' || c.call_status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.call_id.toLowerCase().includes(q) ||
      (c.from_number ?? '').includes(q) ||
      (c.transcript ?? '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts: Record<string, number> = {
    all: calls.length,
    ongoing: calls.filter(c => c.call_status === 'ongoing').length,
    ended: calls.filter(c => c.call_status === 'ended').length,
    error: calls.filter(c => c.call_status === 'error').length,
    registered: calls.filter(c => c.call_status === 'registered').length,
  }

  const filterColors: Record<string, string> = {
    ongoing: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ended: 'bg-slate-100 text-slate-600 border-slate-200',
    error: 'bg-red-100 text-red-600 border-red-200',
    registered: 'bg-blue-100 text-blue-700 border-blue-200',
    all: '',
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="Call Monitoring"
        subtitle="Live and historical call logs"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: calls.length, color: 'from-slate-400 to-slate-500' },
            { label: 'Ongoing', value: counts.ongoing, color: 'from-emerald-400 to-teal-500' },
            { label: 'Ended', value: counts.ended, color: 'from-sky-400 to-blue-500' },
            { label: 'Errors', value: counts.error, color: 'from-red-400 to-rose-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
              <div className={`text-xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{value}</div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search caller number, call ID or transcript…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-slate-50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    statusFilter === s
                      ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white border-transparent shadow-md shadow-blue-200'
                      : s === 'all'
                      ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      : `${filterColors[s]} hover:opacity-80`
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Call list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                <Phone size={11} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {filtered.length} call{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-xs text-slate-400">Click a row to expand transcript</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <Phone size={40} className="mx-auto mb-3" />
              <p className="text-sm text-slate-400">No calls found</p>
            </div>
          ) : (
            filtered.map(call => <CallRow key={call.call_id} call={call} />)
          )}
        </div>
      </div>
    </div>
  )
}
