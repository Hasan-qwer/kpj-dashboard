'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from '@/components/sidebar-context'
import { Menu, RefreshCw, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  onRefresh?: () => void
  refreshing?: boolean
}

export function Header({ title, onRefresh, refreshing }: HeaderProps) {
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
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#003366] hover:bg-[#004488] rounded-lg transition-colors disabled:opacity-60"
          aria-label="Sign out"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
