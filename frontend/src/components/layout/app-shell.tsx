import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AppShellProps {
  sidebar: React.ReactNode
  panel?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AppShell({ sidebar, panel, children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        'flex h-screen bg-[#f0f0f0] font-[Inter,sans-serif] overflow-hidden',
        className
      )}
    >
      {sidebar}
      {panel}
      <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
