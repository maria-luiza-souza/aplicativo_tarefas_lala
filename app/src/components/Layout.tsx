import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { Note, SyncState, Task, ViewKey } from '../types';
import { useWorkspace } from '../workspace';
import { Brand } from './Brand';
import { Sidebar } from './Sidebar';

const nav: Array<{ key: ViewKey; label: string }> = [
  { key: 'today', label: 'Meu Dia' },
  { key: 'tasks', label: 'Tarefas' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'calendar', label: 'Calendário' },
  { key: 'notes', label: 'Anotações' },
  { key: 'dashboard', label: 'Dashboard' }
];

const viewMeta: Record<ViewKey, { title: string; subtitle: string }> = {
  today: { title: 'Meu Dia', subtitle: 'O essencial para avançar agora.' },
  tasks: { title: 'Tarefas', subtitle: 'Planeje, filtre e acompanhe seu trabalho.' },
  kanban: { title: 'Kanban', subtitle: 'Visualize o fluxo das atividades.' },
  calendar: { title: 'Calendário', subtitle: 'Veja prazos e entregas no tempo.' },
  notes: { title: 'Anotações', subtitle: 'Registre informações rápidas e contexto.' },
  dashboard: { title: 'Dashboard', subtitle: 'Indicadores de produtividade e andamento.' }
};

function NavIcon({ view }: { view: ViewKey }) {
  const common = 'h-[18px] w-[18px] shrink-0';

  if (view === 'today') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 10.5 9-7 9 7M5.5 9.5V20h13V9.5M9 20v-6h6v6" />
      </svg>
    );
  }

  if (view === 'tasks') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (view === 'kanban') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="4" width="5" height="16" rx="2" />
        <rect x="9.5" y="4" width="5" height="10" rx="2" />
        <rect x="15.5" y="4" width="5" height="13" rx="2" />
      </svg>
    );
  }

  if (view === 'calendar') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
        <path strokeLinecap="round" d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" />
      </svg>
    );
  }

  if (view === 'notes') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5h12a2 2 0 0 1 2 2v9L15.5 20H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" d="M8 9h8M8 13h6" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}

function csvEscape(value: string | number): string {
  const text = String(value ?? '');
  return '"' + text.replaceAll('"', '""') + '"';
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Layout({
  user,
  activeView,
  setActiveView,
  syncState,
  search,
  setSearch,
  onCreateTask,
  theme,
  onToggleTheme,
  children
}: {
  user: User;
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  syncState: SyncState;
  search: string;
  setSearch: (value: string) => void;
  onCreateTask: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  children: ReactNode;
}) {
  const meta = viewMeta[activeView];
  const { tasks, notes, replaceWorkspace } = useWorkspace();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('ulala_sidebar_collapsed') === '1'
  );
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ulala_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  function navigate(view: ViewKey) {
    setActiveView(view);
    setMobileMoreOpen(false);
  }

  function exportJson() {
    downloadFile(
      'ulala-backup-' + new Date().toISOString().slice(0, 10) + '.json',
      JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), tasks, notes }, null, 2),
      'application/json'
    );
  }

  function exportCsv() {
    const header = [
      'Título',
      'Status',
      'Prioridade',
      'Área',
      'Projeto',
      'Vencimento',
      'Conclusão',
      'Horas',
      'Tags',
      'Próxima ação',
      'Descrição',
      'Recorrência',
      'Lembrete'
    ];

    const rows = tasks.map(task => [
      task.title,
      task.status,
      task.priority,
      task.area,
      task.project,
      task.due,
      task.completedAt,
      task.hours,
      task.tags.join(', '),
      task.nextAction,
      task.description,
      task.recurrence,
      task.reminder
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(value => csvEscape(value)).join(';'))
      .join('\n');

    downloadFile(
      'ulala-tarefas-' + new Date().toISOString().slice(0, 10) + '.csv',
      '\uFEFF' + csv,
      'text/csv;charset=utf-8'
    );
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as {
        tasks?: Task[];
        notes?: Note[];
      };

      if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.notes)) {
        alert('Este arquivo não parece ser um backup válido do ULALÁ.');
        return;
      }

      if (!confirm('Restaurar este backup substituirá as tarefas e anotações atuais. Continuar?')) {
        return;
      }

      replaceWorkspace(parsed.tasks, parsed.notes);
      alert('Backup restaurado com sucesso.');
    } catch {
      alert('Não foi possível ler este arquivo de backup.');
    }
  }

  const toolButtonClass =
    'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';

  const tools = (
    <>
      <button type="button" className={toolButtonClass} onClick={exportCsv}><span aria-hidden="true">↓</span><b className="font-medium">Exportar tarefas CSV</b></button>
      <button type="button" className={toolButtonClass} onClick={exportJson}><span aria-hidden="true">⇩</span><b className="font-medium">Backup completo JSON</b></button>
      <button type="button" className={toolButtonClass} onClick={() => restoreInputRef.current?.click()}><span aria-hidden="true">↑</span><b className="font-medium">Restaurar backup</b></button>
      <button type="button" className={toolButtonClass} onClick={onToggleTheme}>
        <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        <b className="font-medium">{theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}</b>
      </button>
    </>
  );

  return (
    <div
      className={
        sidebarCollapsed
          ? 'min-h-screen bg-app-bg text-app-text md:grid md:grid-cols-[72px_minmax(0,1fr)] dark:bg-slate-950 dark:text-slate-100'
          : 'min-h-screen bg-app-bg text-app-text md:grid md:grid-cols-[248px_minmax(0,1fr)] dark:bg-slate-950 dark:text-slate-100'
      }
    >
      <input
        ref={restoreInputRef}
        className="fixed h-px w-px opacity-0 pointer-events-none"
        type="file"
        accept=".json,application/json"
        onChange={restoreBackup}
      />

      <Sidebar
        activeView={activeView}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        syncState={syncState}
        tools={tools}
        onLogout={() => void signOut(auth)}
      />

      <main className="min-w-0 bg-app-bg dark:bg-slate-950">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7 dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 md:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={() => setSidebarCollapsed(current => !current)}
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              <span className="grid gap-1">
                <span className="block h-[2px] w-4 rounded-full bg-current" />
                <span className="block h-[2px] w-4 rounded-full bg-current" />
                <span className="block h-[2px] w-4 rounded-full bg-current" />
              </span>
            </button>

            <div className="md:hidden">
              <Brand compact />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-[-0.025em] text-slate-950 md:text-2xl dark:text-white">{meta.title}</h1>
              <p className="mt-0.5 hidden truncate text-sm text-slate-500 sm:block dark:text-slate-400">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="hidden h-10 w-[min(320px,28vw)] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 lg:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
              <SearchIcon />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar tarefa, projeto, área..."
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
              aria-label={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            <button
              type="button"
              className="hidden h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:inline-flex"
              onClick={onCreateTask}
            >
              + Nova tarefa
            </button>

            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 pr-2 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => void signOut(auth)}
              title="Sair da conta"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-md object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold dark:bg-slate-800">
                  {(user.displayName || 'U').charAt(0)}
                </span>
              )}
              <strong className="hidden max-w-24 truncate text-sm font-medium md:block">{user.displayName?.split(' ')[0] || 'Conta'}</strong>
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] px-3 pb-24 pt-5 sm:px-5 md:px-7 md:pt-7">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95" aria-label="Navegação mobile">
        {nav.slice(0, 4).map(item => {
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={active
                ? 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-indigo-600 dark:text-indigo-400'
                : 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-slate-500 dark:text-slate-400'}
              onClick={() => navigate(item.key)}
            >
              <NavIcon view={item.key} />
              <small className="text-[11px] font-medium">{item.label}</small>
            </button>
          );
        })}

        <button
          type="button"
          className={mobileMoreOpen || activeView === 'notes' || activeView === 'dashboard'
            ? 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-indigo-600 dark:text-indigo-400'
            : 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-slate-500 dark:text-slate-400'}
          onClick={() => setMobileMoreOpen(true)}
        >
          <span className="text-lg leading-none" aria-hidden="true">•••</span>
          <small className="text-[11px] font-medium">Mais</small>
        </button>
      </nav>

      <button
        type="button"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-light text-white shadow-lg shadow-indigo-600/20 sm:hidden"
        onClick={onCreateTask}
        aria-label="Nova tarefa"
      >
        +
      </button>

      {mobileMoreOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-slate-950/35 backdrop-blur-sm md:hidden"
          onMouseDown={event => event.target === event.currentTarget && setMobileMoreOpen(false)}
        >
          <section className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />

            <header className="mb-4 flex items-center justify-between gap-3">
              <Brand subtitle="Mais opções" />
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                onClick={() => setMobileMoreOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 text-left text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200" onClick={() => navigate('notes')}>
                <NavIcon view="notes" /> Anotações
              </button>
              <button type="button" className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 text-left text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200" onClick={() => navigate('dashboard')}>
                <NavIcon view="dashboard" /> Dashboard
              </button>
            </div>

            <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
            <div className="grid gap-1">{tools}</div>

            <button
              type="button"
              className="mt-4 min-h-11 w-full rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              onClick={() => void signOut(auth)}
            >
              Sair da conta
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
