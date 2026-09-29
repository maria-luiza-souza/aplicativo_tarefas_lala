import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { Task, TaskFilter, ViewKey } from './types';
import { WorkspaceProvider, useWorkspace } from './workspace';
import { Layout } from './components/Layout';
import { Brand } from './components/Brand';
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
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <button
        type="button"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
        aria-label={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>

      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-7 py-9 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mb-8">
          <Brand centered size="hero" subtitle="Productivity workspace" />
        </div>

        <div className="mx-auto mb-8 max-w-sm text-center">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Organize o trabalho com clareza
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Tarefas, projetos, prazos e anotações em um único espaço.
          </p>
        </div>

        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15 disabled:cursor-default disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={() => void login()}
          disabled={loading}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">G</span>
          {loading ? 'Entrando...' : 'Continuar com Google'}
        </button>

        {error && (
          <small className="mt-3 block text-center text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </small>
        )}

        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          O Google é usado apenas para autenticação.
        </p>
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
