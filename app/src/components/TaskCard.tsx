import type { Task } from '../types';
import { daysDiff, fmtDate } from '../utils';
import { useWorkspace } from '../workspace';
import { Badge, type BadgeTone } from './ui/Badge';

function priorityTone(priority: Task['priority']): BadgeTone {
  if (priority === 'Urgente') return 'danger';
  if (priority === 'Alta') return 'warning';
  if (priority === 'Média') return 'indigo';
  return 'neutral';
}

function statusTone(status: Task['status']): BadgeTone {
  if (status === 'Concluída') return 'success';
  if (status === 'Em Andamento') return 'indigo';
  if (status === 'Aguardando') return 'violet';
  return 'neutral';
}

export function TaskCard({
  task,
  onEdit,
  compact = false
}: {
  task: Task;
  onEdit: (task: Task) => void;
  compact?: boolean;
}) {
  const { toggleTaskDone } = useWorkspace();
  const diff = daysDiff(task.due);
  const done = task.status === 'Concluída';
  const overdue = diff !== null && diff < 0 && !done;

  let dueLabel = 'Sem vencimento';
  if (diff === 0) dueLabel = 'Hoje';
  else if (diff === 1) dueLabel = 'Amanhã';
  else if (diff !== null && diff < 0) dueLabel = 'Atrasada · ' + fmtDate(task.due);
  else if (task.due) dueLabel = fmtDate(task.due);

  return (
    <article
      className={[
        'group grid min-w-0 grid-cols-[36px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-slate-200 bg-white transition',
        'hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        compact ? 'p-3' : 'p-4'
      ].join(' ')}
    >
      <button
        type="button"
        className={[
          'mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
          done
            ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border-slate-300 bg-white text-transparent hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10'
        ].join(' ')}
        onClick={() => toggleTaskDone(task.id)}
        aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
      >
        {done ? '✓' : '✓'}
      </button>

      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => onEdit(task)}
          >
            <strong
              className={[
                'block truncate text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100',
                done ? 'text-slate-400 line-through dark:text-slate-500' : ''
              ].join(' ')}
            >
              {task.title}
            </strong>
          </button>

          {!compact && <Badge tone={statusTone(task.status)}>{task.status}</Badge>}
        </div>

        <button
          type="button"
          className="mt-2 flex max-w-full flex-wrap items-center gap-2 text-left"
          onClick={() => onEdit(task)}
        >
          <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>

          <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {task.project || task.area || 'Sem projeto'}
          </span>

          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">•</span>

          <span
            className={
              overdue
                ? 'text-xs font-semibold text-red-600 dark:text-red-400'
                : 'text-xs font-medium text-slate-500 dark:text-slate-400'
            }
          >
            {dueLabel}
          </span>
        </button>

        {compact && (
          <div className="mt-2">
            <Badge tone={statusTone(task.status)}>{task.status}</Badge>
          </div>
        )}
      </div>
    </article>
  );
}
