import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-press select-none'

  const variants = {
    primary:   'bg-gradient-to-r from-accent to-accent-dark text-white shadow-[0_2px_8px_rgba(155,107,179,0.35)] hover:shadow-[0_4px_16px_rgba(155,107,179,0.45)] hover:-translate-y-px focus-visible:ring-accent',
    secondary: 'bg-background-secondary border border-border text-text-primary hover:bg-hover hover:-translate-y-px focus-visible:ring-accent',
    danger:    'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_2px_8px_rgba(239,68,68,0.30)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.40)] hover:-translate-y-px focus-visible:ring-red-500',
    ghost:     'text-text-secondary hover:bg-hover hover:text-text-primary focus-visible:ring-accent',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  )
}
