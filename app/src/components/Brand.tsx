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
  const logoIcon = import.meta.env.BASE_URL + 'brand/ulala-icon.webp';
  const logoFull = import.meta.env.BASE_URL + 'brand/ulala-logo-full.webp';

  if (size === 'hero') {
    return (
      <div className={centered ? 'flex flex-col items-center' : 'flex flex-col items-start'}>
        <div className="w-full max-w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-slate-700">
          <img
            src={logoFull}
            alt="ULALÁ — Minhas tarefas"
            className="block aspect-square w-full object-cover"
          />
        </div>
        <span className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {subtitle}
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <span
        aria-label="ULALÁ"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700"
      >
        <img
          src={logoIcon}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <div className={centered ? 'flex items-center justify-center gap-3' : 'flex items-center gap-3'}>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700">
        <img
          src={logoIcon}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>

      <div className={centered ? 'flex flex-col items-center' : 'flex flex-col items-start'}>
        <span className="text-[1.2rem] font-bold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">
          ULALÁ
        </span>
        <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
