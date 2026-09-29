import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'indigo' | 'success' | 'warning' | 'danger' | 'violet';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
};

export function Badge({
  tone = 'neutral',
  children,
  className = ''
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        'inline-flex min-h-6 items-center rounded-md px-2 text-[11px] font-semibold leading-none',
        tones[tone],
        className
      ].join(' ')}
    >
      {children}
    </span>
  );
}
