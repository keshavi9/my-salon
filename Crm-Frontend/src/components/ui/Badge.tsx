import { ReactNode } from 'react'
import { cn, getStatusColor } from '@/utils/helpers'

interface BadgeProps {
  children: ReactNode
  status?: string
  className?: string
}

export default function Badge({ children, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        status ? getStatusColor(status) : 'bg-hover text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  )
}
