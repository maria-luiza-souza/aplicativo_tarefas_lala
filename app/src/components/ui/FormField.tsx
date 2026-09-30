import type { ReactNode } from 'react';

export function FormField({
  label,
  hint,
  children,
  className = ''
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={['grid gap-2', className].join(' ')}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint && (
        <small className="text-xs leading-5 text-slate-400 dark:text-slate-500">
          {hint}
        </small>
      )}
    </label>
  );
}
