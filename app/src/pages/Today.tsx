import type { Task, TaskFilter } from '../types';
import { daysDiff, priorityRank } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

function StatCard({
  label,
  value,
  description,
  onClick,
  danger = false
}: {
  label: string;
  value: number | string;
  description: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <strong
        className={
          danger
            ? 'mt-2 block text-2xl font-semibold tracking-[-0.03em] text-red-600 dark:text-red-400'
            : 'mt-2 block text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white'
        }
      >
        {value}
      </strong>
      <span className="mt-1 block text-xs leading-5 text-slate-400 dark:text-slate-500">{description}</span>
    </>
  );

  if (!onClick) {
    return (
      <Card className="p-4">
        {content}
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:shadow-none"
    >
      {content}
    </button>
  );
}

export function TodayPage({
  onEdit,
  onOpenTasks
}: {
  onEdit: (task: Task) => void;
  onOpenTasks: (filter: TaskFilter) => void;
}) {
  const { tasks } = useWorkspace();
  const active = tasks.filter(task => task.status !== 'Concluída');
  const today = active.filter(task => daysDiff(task.due) === 0);
  const overdue = active.filter(task => task.due && (daysDiff(task.due) || 0) < 0);
  const waiting = active.filter(task => task.status === 'Aguardando');
  const urgent = active.filter(task => task.priority === 'Urgente');

  const dueTodayAll = tasks.filter(task => daysDiff(task.due) === 0);
  const doneToday = dueTodayAll.filter(task => task.status === 'Concluída').length;
  const progress = dueTodayAll.length ? Math.round((doneToday / dueTodayAll.length) * 100) : 0;
  const hours = dueTodayAll.reduce((sum, task) => sum + (Number(task.hours) || 0), 0);

  const focusMap = new Map<string, Task>();
  [...overdue, ...urgent, ...today].forEach(task => focusMap.set(task.id, task));

  const focus = [...focusMap.values()].sort((a, b) => {
    const aDiff = daysDiff(a.due) ?? 999;
    const bDiff = daysDiff(b.due) ?? 999;
    return aDiff - bDiff || priorityRank(a.priority) - priorityRank(b.priority);
  });

  const upcoming = active
    .filter(task => {
      const diff = daysDiff(task.due);
      return diff !== null && diff > 0 && diff <= 7;
    })
    .sort((a, b) => a.due.localeCompare(b.due));

  const nextTask = focus[0] || upcoming[0];

  let mood = 'Começando';
  if (!dueTodayAll.length) mood = 'Dia livre';
  else if (progress === 100) mood = 'Tudo concluído';
  else if (progress >= 75) mood = 'Quase lá';
  else if (progress >= 40) mood = 'Bom ritmo';
  else if (progress > 0) mood = 'Em movimento';

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <span className="text-sm font-medium capitalize text-slate-500 dark:text-slate-400">
              {dateLabel}
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl dark:text-white">
              Seu foco de hoje
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
              {overdue.length
                ? overdue.length + ' tarefa' + (overdue.length === 1 ? ' atrasada precisa' : 's atrasadas precisam') + ' de atenção.'
                : today.length
                  ? today.length + ' tarefa' + (today.length === 1 ? '' : 's') + ' para avançar hoje.'
                  : 'Seu dia está organizado. Use este espaço para manter o foco.'}
            </p>
          </div>

          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 lg:w-[320px] dark:border-slate-700 dark:bg-slate-950/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progresso de hoje</span>
                <strong className="mt-1 block text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {progress}%
                </strong>
              </div>
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {mood}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-[width] duration-500 dark:bg-indigo-500"
                style={{ width: progress + '%' }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {doneToday} de {dueTodayAll.length} tarefas concluídas
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Para hoje"
            value={today.length}
            description="Tarefas com vencimento hoje"
            onClick={() => onOpenTasks('today')}
          />
          <StatCard
            label="Atrasadas"
            value={overdue.length}
            description="Itens que precisam de atenção"
            danger={overdue.length > 0}
            onClick={() => onOpenTasks('overdue')}
          />
          <StatCard
            label="Aguardando"
            value={waiting.length}
            description="Dependências e retornos pendentes"
            onClick={() => onOpenTasks('waiting')}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="min-w-0 p-5">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-400">
                Foco agora
              </span>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                Prioridades do dia
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                O que merece sua atenção primeiro.
              </p>
            </div>

            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {focus.length}
            </span>
          </header>

          <div className="grid gap-2.5">
            {focus.length ? (
              focus.slice(0, 4).map(task => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} compact />
              ))
            ) : (
              <EmptyState
                icon={<span aria-hidden="true">✓</span>}
                title="Nada crítico agora"
                description="Você está em dia com as prioridades."
              />
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Próxima ação
            </span>

            {nextTask ? (
              <button
                type="button"
                onClick={() => onEdit(nextTask)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"
              >
                <strong className="block text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                  {nextTask.title}
                </strong>
                <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
                  {nextTask.project || nextTask.area || 'Sem projeto'}
                </span>
              </button>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Nenhuma tarefa imediata. Seu foco está livre.
              </p>
            )}

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Carga planejada</span>
              <strong className="mt-1 block text-lg font-semibold text-slate-950 dark:text-white">
                {hours ? hours.toFixed(hours % 1 ? 1 : 0) + 'h' : 'Sem estimativa'}
              </strong>
            </div>
          </Card>

          <Card className="p-5">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Próximos 7 dias
                </span>
                <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                  O que vem depois
                </h3>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {upcoming.length}
              </span>
            </header>

            {upcoming.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcoming.slice(0, 5).map(task => {
                  const diff = daysDiff(task.due) || 0;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onEdit(task)}
                      className="flex w-full items-center gap-3 py-3 text-left first:pt-1 last:pb-0"
                    >
                      <span className="min-w-[74px] rounded-md bg-slate-100 px-2 py-1 text-center text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {diff === 1 ? 'Amanhã' : 'Em ' + diff + ' dias'}
                      </span>

                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {task.title}
                        </strong>
                        <small className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {task.project || task.area || task.priority}
                        </small>
                      </span>

                      <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">›</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                className="min-h-32"
                icon={<span aria-hidden="true">○</span>}
                title="Agenda tranquila"
                description="Nada previsto para os próximos 7 dias."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
