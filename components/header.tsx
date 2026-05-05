'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/components/sidebar-context'
import { Menu, RefreshCw, LogOut, Bell } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export function Header({ title, subtitle, onRefresh, refreshing }: HeaderProps) {
  const router = useRouter()
  const { toggle } = useSidebar()
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell placeholder */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all hidden sm:flex">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #003366, #0057a8)' }}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline text-xs">{signingOut ? 'Signing out…' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
