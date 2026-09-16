import { ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  accent?: boolean
}

export default function Card({ children, className, hover = false, onClick, accent = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-250',
        'bg-background-secondary border border-border',
        hover && 'card-lift cursor-pointer',
        accent && 'relative overflow-hidden',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
      onClick={onClick}
    >
      {accent && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-[var(--accent-light)] to-[var(--accent-light)]" />
      )}
      <div className={cn('p-5', accent && 'pt-5')}>
        {children}
      </div>
    </div>
  )
}
