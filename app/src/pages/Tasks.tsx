import { useMemo, useState } from 'react';
import type { Task, TaskFilter, TaskPriority, TaskStatus } from '../types';
import { daysDiff, priorityRank } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

const filterOptions: Array<[TaskFilter, string]> = [
  ['all', 'Todas'],
  ['today', 'Hoje'],
  ['overdue', 'Atrasadas'],
  ['week', 'Esta semana'],
  ['done', 'Concluídas'],
  ['waiting', 'Aguardando']
];

const selectClass =
  'min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition ' +
  'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ' +
  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';

export function TasksPage({
  search,
  filter,
  setFilter,
  onEdit,
  onCreate
}: {
  search: string;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  onEdit: (task: Task) => void;
  onCreate: () => void;
}) {
  const { tasks } = useWorkspace();
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [sort, setSort] = useState<'due' | 'priority' | 'title'>('due');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tasks
      .filter(task => {
        if (q) {
          const haystack = [
            task.title,
            task.project,
            task.area,
            task.description,
            task.tags.join(' ')
          ].join(' ').toLowerCase();

          if (!haystack.includes(q)) return false;
        }

        if (status && task.status !== status) return false;
        if (priority && task.priority !== priority) return false;

        const diff = daysDiff(task.due);

        if (filter === 'today' && (task.status === 'Concluída' || diff !== 0)) return false;
        if (filter === 'overdue' && (task.status === 'Concluída' || diff === null || diff >= 0)) return false;
        if (filter === 'week' && (task.status === 'Concluída' || diff === null || diff < 0 || diff > 7)) return false;
        if (filter === 'done' && task.status !== 'Concluída') return false;
        if (filter === 'waiting' && task.status !== 'Aguardando') return false;

        return true;
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title, 'pt-BR');
        if (sort === 'priority') return priorityRank(a.priority) - priorityRank(b.priority);
        return (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99');
      });
  }, [tasks, search, status, priority, filter, sort]);

  const hasAdvancedFilters = Boolean(status || priority || sort !== 'due');

  function clearAdvancedFilters() {
    setStatus('');
    setPriority('');
    setSort('due');
  }

  return (
    <div className="grid gap-5">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Visualização
              </span>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                Organize suas tarefas
              </h2>
            </div>

            <Button variant="primary" onClick={onCreate} className="w-full sm:w-auto">
              + Nova tarefa
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {filterOptions.map(([key, label]) => {
              const active = filter === key;

              return (
                <button
                  key={key}
                  type="button"
                  className={[
                    'min-h-9 shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors',
                    active
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  ].join(' ')}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
              <select
                className={selectClass}
                value={status}
                onChange={event => setStatus(event.target.value as TaskStatus | '')}
              >
                <option value="">Todos os status</option>
                <option>Pendente</option>
                <option>Em Andamento</option>
                <option>Aguardando</option>
                <option>Concluída</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Prioridade</span>
              <select
                className={selectClass}
                value={priority}
                onChange={event => setPriority(event.target.value as TaskPriority | '')}
              >
                <option value="">Todas as prioridades</option>
                <option>Urgente</option>
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ordenação</span>
              <select
                className={selectClass}
                value={sort}
                onChange={event => setSort(event.target.value as 'due' | 'priority' | 'title')}
              >
                <option value="due">Vencimento</option>
                <option value="priority">Prioridade</option>
                <option value="title">Título</option>
              </select>
            </label>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full lg:w-auto"
                disabled={!hasAdvancedFilters}
                onClick={clearAdvancedFilters}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col justify-between gap-2 px-1 sm:flex-row sm:items-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <strong className="font-semibold text-slate-900 dark:text-white">{filtered.length}</strong>
          {' '}tarefa{filtered.length === 1 ? '' : 's'} encontrada{filtered.length === 1 ? '' : 's'}
        </div>

        {search.trim() && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Resultado da busca por “{search.trim()}”
          </span>
        )}
      </div>

      <section className="grid gap-3">
        {filtered.length ? (
          filtered.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} />)
        ) : (
          <EmptyState
            icon={<span aria-hidden="true">⌕</span>}
            title="Nenhuma tarefa encontrada"
            description="Ajuste os filtros ou crie uma nova tarefa."
          />
        )}
      </section>
    </div>
  );
}
