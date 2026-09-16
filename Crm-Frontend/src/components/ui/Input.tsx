import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200',
            'focus:outline-none input-glow',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:border-red-400'
              : 'border-border focus:border-[var(--accent)]',
            className
          )}
          style={{
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger inline-block" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
