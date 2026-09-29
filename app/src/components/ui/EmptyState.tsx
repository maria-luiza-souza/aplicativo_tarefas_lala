import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  className = ''
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={[
        'flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center',
        'dark:border-slate-700 dark:bg-slate-950/40',
        className
      ].join(' ')}
    >
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {icon}
        </div>
      )}
      <strong className="text-sm font-semibold text-slate-900 dark:text-white">{title}</strong>
      <span className="mt-1 max-w-xs text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</span>
    </div>
  );
}
