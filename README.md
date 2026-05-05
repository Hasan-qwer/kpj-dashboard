# KPJ Damansara — Voice Agent Dashboard

A Next.js 16 dashboard for monitoring the Retell AI voice agent at KPJ Damansara Specialist Hospital. Includes call monitoring with transcripts, doctor directory, appointment management, and Supabase authentication.

---

## Pages

| Route | Description |
|---|---|
| `/login` | Email/password login (Supabase Auth) |
| `/dashboard` | Overview stats — calls, appointments, recent activity |
| `/dashboard/calls` | All Retell AI calls with expandable transcripts, audio playback, filters |
| `/dashboard/doctors` | Full doctor directory (97 doctors) with search, department and language filters |
| `/dashboard/appointments` | Appointment table with add, status update, date and status filters |

---

## Setup

### 1. Install

```bash
cd dashboard
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RETELL_API_KEY=your-retell-api-key
```

### 3. Supabase setup

1. Create a new Supabase project at supabase.com
2. Run `supabase-schema.sql` in the SQL editor — creates the `appointments` table with RLS
3. Go to **Authentication → Users** and create your admin user (email + password)

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

1. Push this `dashboard/` folder to a GitHub repo
2. Import the repo in vercel.com/new
3. Set the **Root Directory** to `dashboard` if you pushed the parent folder
4. Add all 3 environment variables in Vercel → Settings → Environment Variables
5. Deploy — Vercel auto-detects Next.js

---

## Retell AI Integration

The dashboard calls Retell AI's REST API from server-side API routes:

- `GET /api/calls` — lists all calls (POST to Retell `v2/list-calls`)
- `GET /api/calls/[callId]` — fetches one call with full transcript

Your `RETELL_API_KEY` is never exposed to the browser.

---

## Tech stack

- Next.js 16 (App Router, Turbopack)
- Supabase — Auth + PostgreSQL (appointments)
- Retell AI — Voice call data and transcripts
- Tailwind CSS 4
- lucide-react icons
