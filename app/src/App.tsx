import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { Task, TaskFilter, ViewKey } from './types';
import { WorkspaceProvider, useWorkspace } from './workspace';
import { Layout } from './components/Layout';
import { TaskModal } from './components/TaskModal';
import { TodayPage } from './pages/Today';
import { TasksPage } from './pages/Tasks';
import { KanbanPage } from './pages/Kanban';
import { CalendarPage } from './pages/Calendar';
import { NotesPage } from './pages/Notes';
import { DashboardPage } from './pages/Dashboard';

type Theme = 'light' | 'dark';

function LoginScreen({
  theme,
  onToggleTheme
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logo = import.meta.env.BASE_URL + 'logo-ulala.webp';

  async function login() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Não foi possível entrar com Google.';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>

      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-emblem" aria-hidden="true">
            <img src={logo} alt="" />
            <i />
          </div>

          <div className="login-brand-copy">
            <span className="login-brand-kicker">ORGANIZE · PRIORIZE · AVANCE</span>
            <h1>ulalá</h1>
            <small>workspace</small>
          </div>
        </div>

        <p>Organize tarefas, projetos, prazos e anotações em um espaço só seu.</p>

        <button type="button" className="google-button" onClick={() => void login()} disabled={loading}>
          <span>G</span>
          {loading ? 'Entrando...' : 'Continuar com Google'}
        </button>

        {error && <small className="login-error">{error}</small>}
        <em>O Google é usado apenas para autenticação.</em>
      </section>
    </main>
  );
}

function WorkspaceApp({
  user,
  theme,
  onToggleTheme
}: {
  user: User;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const { syncState } = useWorkspace();
  const [activeView, setActiveView] = useState<ViewKey>('today');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  function editTask(task: Task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  function createTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openTasks(nextFilter: TaskFilter) {
    setFilter(nextFilter);
    setActiveView('tasks');
  }

  function changeSearch(value: string) {
    setSearch(value);
    if (value.trim()) setActiveView('tasks');
  }

  return (
    <>
      <Layout
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        syncState={syncState}
        search={search}
        setSearch={changeSearch}
        onCreateTask={createTask}
        theme={theme}
        onToggleTheme={onToggleTheme}
      >
        {activeView === 'today' && <TodayPage onEdit={editTask} onOpenTasks={openTasks} />}
        {activeView === 'tasks' && (
          <TasksPage
            search={search}
            filter={filter}
            setFilter={setFilter}
            onEdit={editTask}
            onCreate={createTask}
          />
        )}
        {activeView === 'kanban' && <KanbanPage onEdit={editTask} />}
        {activeView === 'calendar' && <CalendarPage onEdit={editTask} />}
        {activeView === 'notes' && <NotesPage />}
        {activeView === 'dashboard' && <DashboardPage onOpenTasks={openTasks} theme={theme} />}
      </Layout>

      <TaskModal
        open={taskModalOpen}
        task={editingTask}
        onClose={() => setTaskModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('ulala_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => onAuthStateChanged(auth, current => setUser(current)), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ulala_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  }

  if (user === undefined) {
    return <div className="boot-screen"><span className="boot-dot" /><strong>ULALÁ</strong></div>;
  }

  if (!user) {
    return <LoginScreen theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <WorkspaceProvider user={user}>
      <WorkspaceApp user={user} theme={theme} onToggleTheme={toggleTheme} />
    </WorkspaceProvider>
  );
}
