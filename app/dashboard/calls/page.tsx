'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDuration, formatTimestamp, getStatusColor } from '@/lib/utils'
import type { RetellCall } from '@/types'
import { Phone, ChevronDown, ChevronUp, Search, Mic, MicOff } from 'lucide-react'

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
        <div className="w-5 h-5 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const segments = detail?.transcript_object
  const plainText = detail?.transcript

  if (segments && segments.length > 0) {
    return (
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${seg.role === 'agent' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              seg.role === 'agent' ? 'bg-[#003366] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {seg.role === 'agent' ? <Mic size={12} /> : <MicOff size={12} />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              seg.role === 'agent'
                ? 'bg-[#003366] text-white rounded-tl-none'
                : 'bg-slate-100 text-slate-800 rounded-tr-none'
            }`}>
              <p className="text-xs opacity-60 mb-0.5 font-medium">
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
      <div className="max-h-72 overflow-y-auto">
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{plainText}</pre>
      </div>
    )
  }

  return (
    <p className="text-sm text-slate-400 italic py-2">No transcript available for this call.</p>
  )
}

function CallRow({ call }: { call: RetellCall }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          call.call_status === 'ongoing' ? 'bg-green-500 animate-pulse' :
          call.call_status === 'ended' ? 'bg-slate-400' :
          call.call_status === 'error' ? 'bg-red-400' : 'bg-blue-400'
        }`} />

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800 truncate">
              {call.from_number ?? 'Unknown caller'}
            </p>
            <p className="text-xs text-slate-400 truncate">{call.call_id}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-slate-600">{formatTimestamp(call.start_timestamp)}</p>
            <p className="text-xs text-slate-400">
              {call.disconnection_reason ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{formatDuration(call.duration_ms)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(call.call_status)}`}>
              {call.call_status}
            </span>
          </div>
        </div>

        <div className="text-slate-400 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Call ID</p>
              <p className="text-xs text-slate-700 font-mono mt-0.5 break-all">{call.call_id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Type</p>
              <p className="text-xs text-slate-700 mt-0.5">{call.call_type ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Started</p>
              <p className="text-xs text-slate-700 mt-0.5">{formatTimestamp(call.start_timestamp)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Ended</p>
              <p className="text-xs text-slate-700 mt-0.5">{formatTimestamp(call.end_timestamp)}</p>
            </div>
          </div>

          {call.recording_url && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Recording</p>
              <audio controls src={call.recording_url} className="w-full h-10 rounded" />
            </div>
          )}

          <div>
            <p className="text-xs text-slate-400 font-medium mb-3">Transcript</p>
            <TranscriptViewer call={call} />
          </div>
        </div>
      )}
    </div>
  )
}

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
      if (res.ok) {
        const data = await res.json()
        setCalls(Array.isArray(data) ? data : [])
      }
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

  const statusCounts = {
    all: calls.length,
    ongoing: calls.filter(c => c.call_status === 'ongoing').length,
    ended: calls.filter(c => c.call_status === 'ended').length,
    error: calls.filter(c => c.call_status === 'error').length,
    registered: calls.filter(c => c.call_status === 'registered').length,
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Call Monitoring"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by caller, call ID or transcript…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'ongoing', 'ended', 'error', 'registered'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-[#003366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calls list */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {filtered.length} call{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-slate-400">Click a row to expand transcript</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-7 h-7 border-2 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading calls…</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Phone size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No calls found</p>
            </div>
          ) : (
            <div>
              {filtered.map(call => (
                <CallRow key={call.call_id} call={call} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
