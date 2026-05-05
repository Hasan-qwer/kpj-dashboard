'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { DOCTORS, SPECIALTIES } from '@/lib/doctors-data'
import { Search, ExternalLink, Globe, UserRound } from 'lucide-react'

const LANG_COLORS: Record<string, string> = {
  English: 'bg-blue-100 text-blue-700',
  Malay: 'bg-green-100 text-green-700',
  Mandarin: 'bg-red-100 text-red-700',
  Tamil: 'bg-orange-100 text-orange-700',
  Cantonese: 'bg-yellow-100 text-yellow-700',
  Hindi: 'bg-purple-100 text-purple-700',
}

function DoctorCard({ doctor }: { doctor: (typeof DOCTORS)[0] }) {
  const initials = doctor.name
    .replace(/^(Assoc\.|Prof\.|Dato'|Datuk|Datin|Datin Wira|Dr\.|Puan Sri|To' Puan|Prof\. Emeritus|Emeritus)\s*/gi, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Avatar + Name */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003366] to-[#0066cc] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">{initials || '?'}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 leading-tight">{doctor.name}</h3>
          <p className="text-xs text-[#003366] font-medium mt-0.5 truncate">{doctor.department}</p>
        </div>
      </div>

      {/* Specialty */}
      <div>
        <p className="text-xs text-slate-500 leading-relaxed">{doctor.specialty}</p>
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-1">
        {doctor.languages.map(lang => (
          <span
            key={lang}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANG_COLORS[lang] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Qualifications */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{doctor.qualifications}</p>

      {/* Extra info */}
      {doctor.extraInfo && (
        <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2">{doctor.extraInfo}</p>
      )}

      {/* Profile link */}
      {doctor.profileUrl && (
        <a
          href={doctor.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#003366] hover:underline mt-auto font-medium"
        >
          <ExternalLink size={12} />
          View Profile
        </a>
      )}
    </div>
  )
}

export default function DoctorsPage() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedLang, setSelectedLang] = useState('All')

  const LANGS = ['All', 'English', 'Malay', 'Mandarin', 'Tamil', 'Cantonese', 'Hindi']
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
    <div className="flex flex-col h-full">
      <Header title="Doctors Directory" />

      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialty, or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 font-medium mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] bg-white"
              >
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">Language</label>
              <div className="flex gap-2 flex-wrap">
                {LANGS.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedLang === lang
                        ? 'bg-[#003366] text-white'
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
          <UserRound size={15} className="text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">
            {filtered.length} of {DOCTORS.length} doctors
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
            <Globe size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No doctors match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
