import { useMemo, useState } from 'react';
import type { Task, TaskFilter, TaskPriority, TaskStatus } from '../types';
import { daysDiff, priorityRank } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';

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
          const haystack = [task.title, task.project, task.area, task.description, task.tags.join(' ')].join(' ').toLowerCase();
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

  return (
    <div className="tasks-page">
      <section className="task-toolbar surface">
        <div className="quick-filters">
          {([
            ['all', 'Todas'],
            ['today', 'Hoje'],
            ['overdue', 'Atrasadas'],
            ['week', 'Esta semana'],
            ['done', 'Concluídas'],
            ['waiting', 'Aguardando']
          ] as Array<[TaskFilter, string]>).map(([key, label]) => (
            <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="task-controls">
          <select value={status} onChange={event => setStatus(event.target.value as TaskStatus | '')}>
            <option value="">Todos os status</option>
            <option>Pendente</option>
            <option>Em Andamento</option>
            <option>Aguardando</option>
            <option>Concluída</option>
          </select>
          <select value={priority} onChange={event => setPriority(event.target.value as TaskPriority | '')}>
            <option value="">Todas as prioridades</option>
            <option>Urgente</option>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
          <select value={sort} onChange={event => setSort(event.target.value as 'due' | 'priority' | 'title')}>
            <option value="due">Ordenar por vencimento</option>
            <option value="priority">Ordenar por prioridade</option>
            <option value="title">Ordenar por título</option>
          </select>
          <button type="button" className="button primary" onClick={onCreate}>+ Nova tarefa</button>
        </div>
      </section>

      <div className="list-summary">
        <strong>{filtered.length}</strong>
        <span>tarefa{filtered.length === 1 ? '' : 's'} encontrada{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <section className="task-list-main">
        {filtered.length
          ? filtered.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} />)
          : <div className="surface empty-state large"><b>⌕</b><strong>Nenhuma tarefa encontrada</strong><span>Ajuste os filtros ou crie uma nova tarefa.</span></div>}
      </section>
    </div>
  );
}
