-- ============================================================
-- KPJ Damansara Voice Agent Dashboard — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  patient_name    text not null,
  patient_phone   text,
  doctor_name     text not null,
  specialty       text not null default '',
  appointment_date date not null,
  appointment_time time not null,
  status          text not null default 'scheduled'
                  check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  notes           text,
  call_id         text,
  created_at      timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.appointments enable row level security;

-- Allow authenticated users (dashboard admins) full access
create policy "Authenticated users can manage appointments"
  on public.appointments
  for all
  to authenticated
  using (true)
  with check (true);

-- Index for common queries
create index if not exists appointments_date_idx on public.appointments (appointment_date);
create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists appointments_doctor_idx on public.appointments (doctor_name);

-- ============================================================
-- Seed sample appointments (optional — comment out if not needed)
-- ============================================================
insert into public.appointments (patient_name, patient_phone, doctor_name, specialty, appointment_date, appointment_time, status, notes)
values
  ('Ahmad bin Razali', '+6012-3456789', 'Dr. Tiang Soon Wee', 'Cardiology / Internal Medicine', current_date, '09:00', 'confirmed', 'Follow-up ECG'),
  ('Siti Nur Aisyah', '+6011-9876543', 'Dr. Lee Lin Ing', 'Obstetrics and Gynaecology', current_date, '10:30', 'scheduled', 'First trimester scan'),
  ('Tan Wei Liang', '+6016-5554321', 'Dr. Khoo Yee Laim', 'Psychiatry', current_date + 1, '14:00', 'scheduled', 'Anxiety follow-up'),
  ('Priya A/P Suresh', '+6017-2221234', 'Dr. Saadiah Sulaiman', 'Dermatology', current_date + 2, '11:00', 'scheduled', 'Psoriasis review'),
  ('Mohamed Farouk', '+6013-8887654', 'Dr. Rajeentheran Suntheralingam', 'Urology', current_date - 1, '08:30', 'completed', 'Stone clearance check'),
  ('Lim Ah Kow', '+6019-4443456', 'Dr. Mohd Shamsul Amri Ismail', 'Gastroenterology and Hepatology / Internal Medicine', current_date - 3, '15:00', 'completed', 'Liver function results'),
  ('Rosnah binti Hamid', null, 'Dr. Charlotte Jane Joseph', 'Paediatrics', current_date + 5, '09:30', 'scheduled', 'Developmental assessment for 3-year-old'),
  ('James Rajendran', '+6014-6662345', 'Dr. Kamalanathan Palaniandy', 'Neurosurgery', current_date + 3, '10:00', 'confirmed', 'Post-op spine review');
