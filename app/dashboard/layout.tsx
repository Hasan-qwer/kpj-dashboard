'use client'

import { SidebarProvider, useSidebar } from '@/components/sidebar-context'
import { Sidebar } from '@/components/sidebar'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar()
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={open} onClose={close} />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  )
}
