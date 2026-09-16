import { ReactNode } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export interface VerticalCardProps {
  image?: string | null;
  fallbackIcon?: ReactNode;
  iconBgColor?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeClassName?: string;
  statusBadge?: ReactNode;
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmMsg?: string;
  content?: ReactNode;
  footer: ReactNode;
  style?: React.CSSProperties;
}

export default function VerticalCard({
  image,
  fallbackIcon,
  iconBgColor = 'var(--bg-secondary)',
  badgeText,
  badgeColor,
  badgeClassName = 'bg-background-secondary/70 dark:bg-background-secondary/50',
  statusBadge,
  title,
  onEdit,
  onDelete,
  deleteConfirmMsg = 'Are you sure you want to delete this item?',
  content,
  footer,
  style,
}: VerticalCardProps) {
  return (
    <div className="group relative p-3 rounded-[24px] flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-background-secondary dark:bg-background-secondary border border-border hover:border-transparent h-full" style={style}>
      
      {/* Top Image/Icon Area */}
      <div className="relative w-full aspect-[4/3] shrink-0 rounded-[16px] overflow-hidden flex items-center justify-center mb-4" style={{ background: iconBgColor }}>
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="transition-transform duration-500 group-hover:scale-110">
            {fallbackIcon}
          </div>
        )}
        
        {/* Category Badge overlay */}
        {badgeText && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${badgeClassName}`} 
            style={{ color: badgeColor }}>
            {badgeText}
          </div>
        )}

        {statusBadge && (
          <div className="absolute top-3 right-3">
            {statusBadge}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 px-2 flex flex-col h-full">
        {/* Title & Actions */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-[17px] leading-tight line-clamp-2 pr-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 bg-background dark:bg-background-secondary/80 p-1 rounded-lg backdrop-blur-sm border border-border">
              {onEdit && (
                <button onClick={onEdit} className="p-1.5 rounded-md text-text-secondary hover:text-info hover:bg-hover transition-colors">
                  <Edit2 size={13}/>
                </button>
              )}
              {onDelete && (
                <button onClick={() => { if (confirm(deleteConfirmMsg)) onDelete() }} className="p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors">
                  <Trash2 size={13}/>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic middle content */}
        <div className="mb-4 flex-1 flex flex-col">
          {content}
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {footer}
        </div>
      </div>
    </div>
  )
}
