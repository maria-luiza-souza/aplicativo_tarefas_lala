import type { ReactNode } from 'react';
import type { SyncState, ViewKey } from '../types';
import styles from './Sidebar.module.css';

type SidebarProps = {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  collapsed?: boolean;
  syncState: SyncState;
  tools?: ReactNode;
  onLogout: () => void;
};

const navigation: Array<{ key: ViewKey; label: string }> = [
  { key: 'today', label: 'Meu Dia' },
  { key: 'tasks', label: 'Tarefas' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'calendar', label: 'Calendário' },
  { key: 'notes', label: 'Anotações' },
  { key: 'dashboard', label: 'Dashboard' }
];

function NavIcon({ view }: { view: ViewKey }) {
  if (view === 'today') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m3 10.5 9-7 9 7M5.5 9.5V20h13V9.5M9 20v-6h6v6" />
      </svg>
    );
  }

  if (view === 'tasks') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (view === 'kanban') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="4" width="5" height="16" rx="2" />
        <rect x="9.5" y="4" width="5" height="10" rx="2" />
        <rect x="15.5" y="4" width="5" height="13" rx="2" />
      </svg>
    );
  }

  if (view === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
        <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" />
      </svg>
    );
  }

  if (view === 'notes') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.5h12a2 2 0 0 1 2 2v9L15.5 20H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4M9 12h9" />
    </svg>
  );
}

function syncLabel(state: SyncState) {
  if (state === 'connecting') return 'Conectando';
  if (state === 'saving') return 'Salvando';
  if (state === 'synced') return 'Sincronizado';
  return 'Somente local';
}

export function Sidebar({
  activeView,
  onNavigate,
  collapsed = false,
  syncState,
  tools,
  onLogout
}: SidebarProps) {
  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-label="ulalá">
          {collapsed ? 'u' : 'ulalá'}
        </span>
      </div>

      <div className={styles.divider} />

      <nav className={styles.navigation} aria-label="Navegação principal">
        {!collapsed && <span className={styles.sectionLabel}>Organização</span>}

        {navigation.map(item => {
          const active = activeView === item.key;

          return (
            <button
              key={item.key}
              type="button"
              className={[styles.navItem, active ? styles.active : ''].join(' ')}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.icon}>
                <NavIcon view={item.key} />
              </span>

              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </button>
          );
        })}

        {!collapsed && tools && (
          <details className={styles.tools}>
            <summary>
              <span>Ferramentas</span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className={styles.toolsContent}>{tools}</div>
          </details>
        )}
      </nav>

      <div className={styles.footer}>
        <div
          className={[styles.sync, collapsed ? styles.syncCollapsed : ''].join(' ')}
          title={syncLabel(syncState)}
        >
          <span
            className={[
              styles.syncDot,
              syncState === 'synced'
                ? styles.synced
                : syncState === 'saving' || syncState === 'connecting'
                  ? styles.syncing
                  : styles.local
            ].join(' ')}
          />
          {!collapsed && <span>{syncLabel(syncState)}</span>}
        </div>

        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          title="Sair da conta"
        >
          <span className={styles.icon}><LogoutIcon /></span>
          {!collapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </aside>
  );
}
