export interface Doctor {
  id: string
  name: string
  department: string
  specialty: string
  qualifications: string
  languages: string[]
  profileUrl?: string
  extraInfo?: string
}

export interface RetellCall {
  call_id: string
  call_type: string
  call_status: 'registered' | 'ongoing' | 'ended' | 'error'
  start_timestamp?: number
  end_timestamp?: number
  duration_ms?: number
  from_number?: string
  to_number?: string
  transcript?: string
  transcript_object?: TranscriptSegment[]
  recording_url?: string
  disconnection_reason?: string
  agent_id?: string
  metadata?: Record<string, unknown>
}

export interface TranscriptSegment {
  role: 'agent' | 'user'
  content: string
  words: { word: string; start: number; end: number }[]
}

export interface Appointment {
  id: string
  patient_name: string
  patient_phone?: string
  doctor_name: string
  specialty: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  call_id?: string
}

export interface DashboardStats {
  totalCallsToday: number
  totalCallsThisWeek: number
  averageDuration: number
  appointmentsToday: number
  upcomingAppointments: number
  totalDoctors: number
}
