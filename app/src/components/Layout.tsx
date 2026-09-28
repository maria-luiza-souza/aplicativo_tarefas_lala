import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { SyncState, ViewKey } from '../types';

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
  if (state === 'connecting') return 'Conectando...';
  if (state === 'saving') return 'Salvando...';
  if (state === 'synced') return 'Sincronizado';
  return 'Somente neste aparelho';
}

export function Layout({
  user,
  activeView,
  setActiveView,
  syncState,
  search,
  setSearch,
  onCreateTask,
  children
}: {
  user: User;
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  syncState: SyncState;
  search: string;
  setSearch: (value: string) => void;
  onCreateTask: () => void;
  children: React.ReactNode;
}) {
  const meta = viewMeta[activeView];
  const logo = import.meta.env.BASE_URL + 'logo-ulala.webp';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-sidebar" aria-hidden="true">
            <span className="brand-orbit orbit-one" />
            <span className="brand-orbit orbit-two" />
            <div className="brand-art">
              <img src={logo} alt="" />
            </div>
            <span className="brand-music-note note-one">♪</span>
            <span className="brand-music-note note-two">♫</span>
          </div>

          <div className="brand-lockup">
            <strong>ULALÁ</strong>
            <span>workspace</span>
            <small>Organização da rotina de trabalho</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegação principal">
          {nav.map(item => (
            <button key={item.key} type="button" className={activeView === item.key ? 'active' : ''} onClick={() => setActiveView(item.key)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={'sync-chip sync-' + syncState}>
            <i />
            <span>{syncLabel(syncState)}</span>
          </div>
          <button type="button" onClick={() => void signOut(auth)}>Sair da conta</button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <div className="mobile-brand-mark" aria-hidden="true">
              <img src={logo} alt="" />
              <span>♪</span>
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
          <button key={item.key} type="button" className={activeView === item.key ? 'active' : ''} onClick={() => setActiveView(item.key)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
        <button type="button" className={activeView === 'notes' || activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView(activeView === 'notes' ? 'dashboard' : 'notes')}>
          <span>•••</span>
          <small>Mais</small>
        </button>
      </nav>

      <button className="mobile-fab" type="button" onClick={onCreateTask} aria-label="Nova tarefa">+</button>
    </div>
  );
}
