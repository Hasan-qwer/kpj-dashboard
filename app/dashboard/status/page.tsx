'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { formatDuration, formatTimestamp } from '@/lib/utils'
import type { RetellCall } from '@/types'
import {
  Activity, Phone, CheckCircle2, XCircle,
  Mic, Clock, TrendingUp, Zap, Server,
  Radio, PhoneIncoming, PhoneMissed,
} from 'lucide-react'

function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  )
}

interface GaugeProps { value: number; max: number; color: string; label: string }
function Gauge({ value, max, color, label }: GaugeProps) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100))
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-800">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function StatusPage() {
  const [calls, setCalls] = useState<RetellCall[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const fetchCalls = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/calls?limit=200')
      if (res.ok) setCalls(await res.json().then((d: unknown) => Array.isArray(d) ? d : []))
      setLastRefreshed(new Date())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => fetchCalls(true), 30_000)
    return () => clearInterval(id)
  }, [fetchCalls])

  // Derived metrics
  const ongoing = calls.filter(c => c.call_status === 'ongoing')
  const ended = calls.filter(c => c.call_status === 'ended')
  const errored = calls.filter(c => c.call_status === 'error')
  const registered = calls.filter(c => c.call_status === 'registered')

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayCalls = calls.filter(c => (c.start_timestamp ?? 0) >= today.getTime())

  const endedWithDuration = ended.filter(c => c.duration_ms)
  const avgMs = endedWithDuration.length
    ? endedWithDuration.reduce((s, c) => s + (c.duration_ms ?? 0), 0) / endedWithDuration.length
    : 0
  const maxMs = endedWithDuration.length
    ? Math.max(...endedWithDuration.map(c => c.duration_ms ?? 0))
    : 0

  const successRate = calls.length
    ? Math.round((ended.length / calls.length) * 100)
    : 0

  // Group by hour (last 24h)
  const hourBuckets: number[] = Array(24).fill(0)
  const now = Date.now()
  calls.forEach(c => {
    if (c.start_timestamp && now - c.start_timestamp < 86_400_000) {
      const h = new Date(c.start_timestamp).getHours()
      hourBuckets[h]++
    }
  })
  const maxBucket = Math.max(...hourBuckets, 1)

  const systemComponents = [
    { label: 'Voice Agent', status: 'operational', icon: Mic },
    { label: 'Retell AI API', status: calls.length > 0 || !loading ? 'operational' : 'checking', icon: Radio },
    { label: 'Supabase DB', status: 'operational', icon: Server },
    { label: 'Dashboard', status: 'operational', icon: Zap },
  ]

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="System Status"
        subtitle="Real-time agent and call metrics"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-5">
        {/* Status banner */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <PulsingDot color="bg-emerald-300" />
          <div>
            <p className="text-lg font-bold">All Systems Operational</p>
            <p className="text-emerald-200 text-xs mt-0.5">
              Last refreshed: {lastRefreshed.toLocaleTimeString('en-MY')} · Auto-refreshes every 30s
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Live Calls', value: ongoing.length, icon: Phone, gradient: 'from-emerald-400 to-teal-500', sub: ongoing.length === 0 ? 'No active calls' : 'In progress' },
                { label: 'Today\'s Calls', value: todayCalls.length, icon: PhoneIncoming, gradient: 'from-sky-400 to-blue-600', sub: 'Since midnight' },
                { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, gradient: 'from-violet-400 to-purple-600', sub: `${ended.length} ended calls` },
                { label: 'Errors', value: errored.length, icon: PhoneMissed, gradient: errored.length > 0 ? 'from-red-400 to-rose-600' : 'from-slate-400 to-slate-500', sub: errored.length === 0 ? 'No errors' : 'Need attention' },
              ].map(({ label, value, icon: Icon, gradient, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Call volume — 24h bar chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                    <TrendingUp size={13} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">Call Volume — Last 24 Hours</h3>
                </div>
                <div className="flex items-end gap-1 h-28">
                  {hourBuckets.map((count, h) => {
                    const height = Math.round((count / maxBucket) * 100)
                    const currentH = new Date().getHours()
                    const isNow = h === currentH
                    return (
                      <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        {count > 0 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                            {h}:00 — {count} call{count !== 1 ? 's' : ''}
                          </div>
                        )}
                        <div
                          className={`w-full rounded-t transition-all ${
                            isNow
                              ? 'bg-gradient-to-t from-blue-500 to-sky-400'
                              : count > 0
                              ? 'bg-gradient-to-t from-blue-300/60 to-sky-300/60'
                              : 'bg-slate-100'
                          }`}
                          style={{ height: `${Math.max(height, count > 0 ? 8 : 2)}%` }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-400">12 AM</span>
                  <span className="text-[10px] text-slate-400">6 AM</span>
                  <span className="text-[10px] text-slate-400">12 PM</span>
                  <span className="text-[10px] text-slate-400">6 PM</span>
                  <span className="text-[10px] text-slate-400">11 PM</span>
                </div>
              </div>

              {/* System components */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Server size={13} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">Components</h3>
                </div>
                <div className="space-y-3">
                  {systemComponents.map(({ label, status, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          status === 'operational' ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          <Icon size={13} className={status === 'operational' ? 'text-emerald-600' : 'text-amber-600'} />
                        </div>
                        <span className="text-sm text-slate-700">{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          status === 'operational' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {status === 'operational' ? 'OK' : 'Checking'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration & call breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Duration metrics */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Clock size={13} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">Duration Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Average duration</span>
                    <span className="text-sm font-bold text-slate-800">{formatDuration(avgMs)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Longest call</span>
                    <span className="text-sm font-bold text-slate-800">{formatDuration(maxMs)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Calls with recording</span>
                    <span className="text-sm font-bold text-slate-800">
                      {calls.filter(c => c.recording_url).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">Calls with transcript</span>
                    <span className="text-sm font-bold text-slate-800">
                      {calls.filter(c => c.transcript || c.transcript_object?.length).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                    <Activity size={13} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">Call Breakdown</h3>
                </div>
                <div className="space-y-3">
                  <Gauge value={ended.length} max={calls.length} color="bg-gradient-to-r from-slate-400 to-slate-500" label="Ended" />
                  <Gauge value={ongoing.length} max={calls.length} color="bg-gradient-to-r from-emerald-400 to-teal-500" label="Ongoing" />
                  <Gauge value={registered.length} max={calls.length} color="bg-gradient-to-r from-sky-400 to-blue-500" label="Registered" />
                  <Gauge value={errored.length} max={calls.length} color="bg-gradient-to-r from-red-400 to-rose-500" label="Error" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Total calls</span>
                    <span className="font-bold text-slate-800">{calls.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent errors */}
            {errored.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2 bg-red-50">
                  <XCircle size={16} className="text-red-500" />
                  <h3 className="font-semibold text-red-700 text-sm">Failed Calls ({errored.length})</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {errored.slice(0, 5).map(call => (
                    <div key={call.call_id} className="px-5 py-3 flex items-center gap-3">
                      <XCircle size={14} className="text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-mono truncate">{call.call_id}</p>
                        <p className="text-xs text-slate-400">{formatTimestamp(call.start_timestamp)}</p>
                      </div>
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {call.disconnection_reason ?? 'unknown error'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
