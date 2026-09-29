import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section
      className={[
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-slate-800 dark:bg-slate-900 dark:shadow-none',
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}
