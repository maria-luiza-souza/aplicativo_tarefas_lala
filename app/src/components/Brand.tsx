type BrandProps = {
  compact?: boolean;
  centered?: boolean;
  subtitle?: string;
  size?: 'default' | 'hero';
};

export function Brand({
  compact = false,
  centered = false,
  subtitle = 'Workspace',
  size = 'default'
}: BrandProps) {
  if (compact) {
    return (
      <span
        aria-label="ULALÁ"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold tracking-[-0.04em] text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        U
      </span>
    );
  }

  const wordmarkClass = size === 'hero'
    ? 'text-4xl font-bold leading-none tracking-[-0.06em] text-slate-950 sm:text-5xl dark:text-white'
    : 'text-[1.35rem] font-bold leading-none tracking-[-0.055em] text-slate-950 dark:text-white';

  const subtitleClass = size === 'hero'
    ? 'mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'
    : 'mt-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400';

  return (
    <div className={centered ? 'flex flex-col items-center' : 'flex flex-col items-start'}>
      <span className={wordmarkClass}>ULALÁ</span>
      <span className={subtitleClass}>{subtitle}</span>
    </div>
  );
}
