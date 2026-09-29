import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500/20 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white',
  secondary:
    'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-slate-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
  ghost:
    'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-400/20 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger:
    'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-500/15 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50'
};

export function Button({
  variant = 'secondary',
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      ].join(' ')}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
