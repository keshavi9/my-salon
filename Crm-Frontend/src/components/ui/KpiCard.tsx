import { cn } from '@/utils/helpers'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

export interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  className?: string
  href?: string
}

export function KpiCard({ label, value, icon: Icon, color = 'var(--accent)', className, href }: KpiCardProps) {
  const cardClasses = cn(
    "group flex items-center rounded-2xl border border-border/60 bg-background-secondary/70 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-transparent dark:shadow-md dark:shadow-zinc-700/50 dark:bg-background-secondary/70 gap-4 h-full",
    href ? "cursor-pointer" : "",
    className
  )

  const CardContent = (
    <>
      {/* Icon Badge */}
      <div 
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-black/5 dark:border-transparent bg-black/[0.03] dark:bg-white/[0.06] transition-transform group-hover:scale-105" 
        style={{ color: color }}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>
      
      {/* Text Stack */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="text-[30px] font-bold tracking-tight text-text-primary dark:text-text-primary leading-none">
          {value}
        </div>
        <div className="mt-1.5 truncate text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary group-hover:text-text-primary transition-colors">
          {label}
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {CardContent}
      </Link>
    )
  }

  return (
    <div className={cardClasses}>
      {CardContent}
    </div>
  )
}
