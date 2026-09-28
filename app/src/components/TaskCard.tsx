import type { Task } from '../types';
import { daysDiff, fmtDate } from '../utils';
import { useWorkspace } from '../workspace';

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

  let dueLabel = 'Sem vencimento';
  if (diff === 0) dueLabel = 'Hoje';
  else if (diff === 1) dueLabel = 'Amanhã';
  else if (diff !== null && diff < 0) dueLabel = 'Atrasada · ' + fmtDate(task.due);
  else if (task.due) dueLabel = fmtDate(task.due);

  return (
    <article className={'task-card ' + (compact ? 'compact' : '')}>
      <button
        type="button"
        className={'task-check ' + (task.status === 'Concluída' ? 'done' : '')}
        onClick={() => toggleTaskDone(task.id)}
        aria-label={task.status === 'Concluída' ? 'Reabrir tarefa' : 'Concluir tarefa'}
      >
        {task.status === 'Concluída' ? '✓' : ''}
      </button>

      <button type="button" className="task-card-main" onClick={() => onEdit(task)}>
        <strong>{task.title}</strong>
        <span className="task-meta">
          <span className={'priority priority-' + task.priority.toLowerCase()}>{task.priority}</span>
          <span>{task.project || task.area || 'Sem projeto'}</span>
          <span className={diff !== null && diff < 0 && task.status !== 'Concluída' ? 'danger-text' : ''}>
            {dueLabel}
          </span>
        </span>
      </button>

      <span className={'status status-' + task.status.replaceAll(' ', '-').toLowerCase()}>
        {task.status}
      </span>
    </article>
  );
}
