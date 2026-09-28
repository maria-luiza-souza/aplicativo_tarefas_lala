import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { Note, SyncState, Task, ViewKey } from '../types';
import { useWorkspace } from '../workspace';

const nav: Array<{ key: ViewKey; icon: string; label: string }> = [
  { key: 'today', icon: '⌂', label: 'Meu Dia' },
  { key: 'tasks', icon: '✓', label: 'Tarefas' },
  { key: 'kanban', icon: '▦', label: 'Kanban' },
  { key: 'calendar', icon: '□', label: 'Calendário' },
  { key: 'notes', icon: '✎', label: 'Anotações' },
  { key: 'dashboard', icon: '◫', label: 'Dashboard' }
];

const viewMeta: Record<ViewKey, { title: string; subtitle: string }> = {
  today: { title: 'Meu Dia', subtitle: 'O essencial para avançar agora.' },
  tasks: { title: 'Tarefas', subtitle: 'Planeje, filtre e acompanhe seu trabalho.' },
  kanban: { title: 'Kanban', subtitle: 'Visualize o fluxo das atividades.' },
  calendar: { title: 'Calendário', subtitle: 'Veja prazos e entregas no tempo.' },
  notes: { title: 'Anotações', subtitle: 'Registre informações rápidas e contexto.' },
  dashboard: { title: 'Dashboard', subtitle: 'Indicadores de produtividade e andamento.' }
};

function syncLabel(state: SyncState): string {
  if (state === 'connecting') return 'Conectando';
  if (state === 'saving') return 'Salvando';
  if (state === 'synced') return 'Sincronizado';
  return 'Somente local';
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
  const logo = import.meta.env.BASE_URL + 'logo-ulala.webp';
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

  const tools = (
    <>
      <button type="button" onClick={exportCsv}><span>⇩</span><b>Exportar tarefas CSV</b></button>
      <button type="button" onClick={exportJson}><span>⤓</span><b>Backup completo JSON</b></button>
      <button type="button" onClick={() => restoreInputRef.current?.click()}><span>⤒</span><b>Restaurar backup</b></button>
      <button type="button" onClick={onToggleTheme}>
        <span>{theme === 'dark' ? '☀' : '☾'}</span>
        <b>{theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}</b>
      </button>
    </>
  );

  return (
    <div className={'app-shell ' + (sidebarCollapsed ? 'sidebar-collapsed' : '')}>
      <input
        ref={restoreInputRef}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        onChange={restoreBackup}
      />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-emblem" aria-hidden="true">
            <img src={logo} alt="" />
            <i />
          </div>

          <div className="brand-wordmark">
            <strong>ulalá</strong>
            <span>workspace</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegação principal">
          <span className="side-nav-label">ORGANIZAÇÃO</span>
          {nav.map(item => (
            <button
              key={item.key}
              type="button"
              title={sidebarCollapsed ? item.label : undefined}
              className={activeView === item.key ? 'active' : ''}
              onClick={() => navigate(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <b>{item.label}</b>
            </button>
          ))}
        </nav>

        <details className="workspace-tools">
          <summary>
            <span>⌘</span>
            <b>Ferramentas</b>
            <i>⌄</i>
          </summary>
          <div className="workspace-tools-list">{tools}</div>
        </details>

        <div className="sidebar-footer">
          <div className={'sync-chip sync-' + syncState} title={syncLabel(syncState)}>
            <i />
            <span>{syncLabel(syncState)}</span>
          </div>
          <button type="button" onClick={() => void signOut(auth)}>
            <span>↪</span>
            <b>Sair da conta</b>
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(current => !current)}
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="mobile-brand-mark" aria-hidden="true">
              <img src={logo} alt="" />
            </div>

            <div className="topbar-title">
              <h1>{meta.title}</h1>
              <p>{meta.subtitle}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <span>⌕</span>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar tarefa, projeto, área..." />
            </label>

            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
              aria-label={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            <button type="button" className="button primary desktop-create" onClick={onCreateTask}>+ Nova tarefa</button>

            <button type="button" className="user-chip" onClick={() => void signOut(auth)} title="Sair da conta">
              {user.photoURL ? <img src={user.photoURL} alt="" /> : <span>{(user.displayName || 'U').charAt(0)}</span>}
              <strong>{user.displayName?.split(' ')[0] || 'Conta'}</strong>
            </button>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Navegação mobile">
        {nav.slice(0, 4).map(item => (
          <button
            key={item.key}
            type="button"
            className={activeView === item.key ? 'active' : ''}
            onClick={() => navigate(item.key)}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
        <button
          type="button"
          className={mobileMoreOpen || activeView === 'notes' || activeView === 'dashboard' ? 'active' : ''}
          onClick={() => setMobileMoreOpen(true)}
        >
          <span>•••</span>
          <small>Mais</small>
        </button>
      </nav>

      <button className="mobile-fab" type="button" onClick={onCreateTask} aria-label="Nova tarefa">+</button>

      {mobileMoreOpen && (
        <div className="mobile-more-backdrop" onMouseDown={event => event.target === event.currentTarget && setMobileMoreOpen(false)}>
          <section className="mobile-more-sheet">
            <div className="mobile-sheet-handle" />
            <header>
              <div><span>ULALÁ</span><h3>Mais opções</h3></div>
              <button type="button" onClick={() => setMobileMoreOpen(false)}>×</button>
            </header>

            <div className="mobile-more-navigation">
              <button type="button" onClick={() => navigate('notes')}><span>✎</span><b>Anotações</b></button>
              <button type="button" onClick={() => navigate('dashboard')}><span>◫</span><b>Dashboard</b></button>
            </div>

            <div className="mobile-tools-title">FERRAMENTAS</div>
            <div className="mobile-tools-list">{tools}</div>

            <button type="button" className="mobile-logout" onClick={() => void signOut(auth)}>
              Sair da conta
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
