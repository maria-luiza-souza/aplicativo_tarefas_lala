import type { Task, TaskStatus } from '../types';
import { useWorkspace } from '../workspace';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

const columns: TaskStatus[] = ['Pendente', 'Em Andamento', 'Aguardando', 'Concluída'];

function columnMeta(status: TaskStatus): { dot: string; tone: BadgeTone } {
  if (status === 'Concluída') return { dot: 'bg-emerald-500', tone: 'success' };
  if (status === 'Em Andamento') return { dot: 'bg-indigo-500', tone: 'indigo' };
  if (status === 'Aguardando') return { dot: 'bg-violet-500', tone: 'violet' };
  return { dot: 'bg-slate-400', tone: 'neutral' };
}

function priorityTone(priority: Task['priority']): BadgeTone {
  if (priority === 'Urgente') return 'danger';
  if (priority === 'Alta') return 'warning';
  if (priority === 'Média') return 'indigo';
  return 'neutral';
}

export function KanbanPage({ onEdit }: { onEdit: (task: Task) => void }) {
  const { tasks, setTaskStatus } = useWorkspace();

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
            Fluxo de trabalho
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
            Kanban
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Arraste cartões entre as colunas ou altere o status pelo seletor.
          </p>
        </div>

        <span className="text-sm text-slate-500 dark:text-slate-400">
          {tasks.length} tarefa{tasks.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-4">
        {columns.map(status => {
          const items = tasks.filter(task => task.status === status);
          const meta = columnMeta(status);

          return (
            <section
              key={status}
              className="min-h-[560px] rounded-2xl border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/55"
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                const id = event.dataTransfer.getData('text/plain');
                if (id) setTaskStatus(id, status);
              }}
            >
              <header className="mb-3 flex items-center justify-between gap-3 px-1 py-1">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={'h-2.5 w-2.5 shrink-0 rounded-full ' + meta.dot} />
                  <strong className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {status}
                  </strong>
                </div>

                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white px-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:shadow-none">
                  {items.length}
                </span>
              </header>

              <div className="grid gap-2.5">
                {items.map(task => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={event => event.dataTransfer.setData('text/plain', task.id)}
                    className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:shadow-none"
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onEdit(task)}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-300 dark:text-slate-600">
                          arrastar
                        </span>
                      </div>

                      <strong className="block text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                        {task.title}
                      </strong>

                      <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {task.project || task.area || 'Sem projeto'}
                      </span>
                    </button>

                    <select
                      aria-label="Mover tarefa"
                      value={task.status}
                      onChange={event => setTaskStatus(task.id, event.target.value as TaskStatus)}
                      className="mt-3 min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      {columns.map(option => <option key={option}>{option}</option>)}
                    </select>
                  </article>
                ))}

                {!items.length && (
                  <EmptyState
                    className="min-h-28 bg-white/60 dark:bg-slate-950/30"
                    icon={<span aria-hidden="true">＋</span>}
                    title="Coluna vazia"
                    description="Arraste tarefas para cá."
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
