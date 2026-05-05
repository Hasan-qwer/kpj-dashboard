'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { DOCTORS, SPECIALTIES } from '@/lib/doctors-data'
import { Search, ExternalLink, UserRound } from 'lucide-react'

const LANG_COLORS: Record<string, string> = {
  English: 'bg-sky-100 text-sky-700',
  Malay: 'bg-emerald-100 text-emerald-700',
  Mandarin: 'bg-red-100 text-red-700',
  Tamil: 'bg-orange-100 text-orange-700',
  Cantonese: 'bg-amber-100 text-amber-700',
  Hindi: 'bg-purple-100 text-purple-700',
}

const DEPT_COLORS: Record<string, string> = {
  'Cardiology': 'from-red-400 to-rose-500',
  'Oncology': 'from-violet-400 to-purple-600',
  'Orthopaedic': 'from-amber-400 to-orange-500',
  'Paediatrics': 'from-cyan-400 to-sky-500',
  'Obstetrics': 'from-pink-400 to-rose-500',
  'Neurology': 'from-indigo-400 to-blue-600',
  'Dermatology': 'from-pink-300 to-fuchsia-500',
  'Psychiatry': 'from-teal-400 to-emerald-500',
  'Gastro': 'from-lime-400 to-green-500',
  'Urology': 'from-sky-400 to-blue-600',
  'ENT': 'from-orange-400 to-amber-500',
}

function getDeptGradient(dept: string) {
  const key = Object.keys(DEPT_COLORS).find(k => dept.toLowerCase().includes(k.toLowerCase()))
  return key ? DEPT_COLORS[key] : 'from-slate-400 to-slate-600'
}

function DoctorCard({ doctor }: { doctor: (typeof DOCTORS)[0] }) {
  const initials = doctor.name
    .replace(/^(Assoc\. Prof\. \(C\)|Assoc\. Prof\.|Prof\. Emeritus|Prof\.|Dato'|Datuk|Datin Wira|Datin|Puan Sri|To' Puan|Dr\.|Emeritus)\s*/gi, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const gradient = getDeptGradient(doctor.department)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden">
      {/* Colored top bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200`}>
            <span className="text-white font-bold text-sm">{initials || '?'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{doctor.name}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1">{doctor.department}</p>
          </div>
        </div>

        {/* Specialty chip */}
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{doctor.specialty}</p>

        {/* Languages */}
        <div className="flex flex-wrap gap-1 mb-3">
          {doctor.languages.map(lang => (
            <span key={lang} className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${LANG_COLORS[lang] ?? 'bg-slate-100 text-slate-600'}`}>
              {lang}
            </span>
          ))}
        </div>

        {/* Qualifications */}
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">{doctor.qualifications}</p>

        {/* Extra info */}
        {doctor.extraInfo && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3">
            <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2">{doctor.extraInfo}</p>
          </div>
        )}

        {/* Profile link */}
        {doctor.profileUrl && (
          <a
            href={doctor.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-opacity`}
          >
            <ExternalLink size={11} />
            View Profile
          </a>
        )}
      </div>
    </div>
  )
}

const LANGS = ['All', 'English', 'Malay', 'Mandarin', 'Tamil', 'Cantonese', 'Hindi']

export default function DoctorsPage() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedLang, setSelectedLang] = useState('All')

  const DEPTS = ['All', ...SPECIALTIES]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return DOCTORS.filter(d => {
      const matchDept = selectedDept === 'All' || d.department === selectedDept
      const matchLang = selectedLang === 'All' || d.languages.includes(selectedLang)
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        (d.extraInfo ?? '').toLowerCase().includes(q)
      return matchDept && matchLang && matchSearch
    })
  }, [search, selectedDept, selectedLang])

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <Header
        title="Doctors Directory"
        subtitle={`${DOCTORS.length} specialists across 45+ departments`}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-slate-50"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Department</label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              >
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Language</label>
              <div className="flex gap-1.5 flex-wrap">
                {LANGS.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedLang === lang
                        ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-blue-200'
                        : LANG_COLORS[lang]
                          ? `${LANG_COLORS[lang]} border border-current/20`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <UserRound size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {filtered.length} of {DOCTORS.length} doctors
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center text-slate-300">
            <UserRound size={40} className="mx-auto mb-3" />
            <p className="text-sm text-slate-400">No doctors match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        )}
      </div>
    </div>
  )
}
