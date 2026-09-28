import type { Task, TaskFilter } from '../types';
import { daysDiff, priorityRank } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';

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
  else if (progress === 100) mood = 'Tudo concluído ✨';
  else if (progress >= 75) mood = 'Quase lá';
  else if (progress >= 40) mood = 'Bom ritmo';
  else if (progress > 0) mood = 'Em movimento';

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });

  return (
    <div className="today-page">
      <section className="today-hero">
        <div className="today-copy">
          <span className="today-date">{dateLabel}</span>
          <h2>Seu foco de hoje</h2>
          <p>
            {overdue.length
              ? overdue.length + ' tarefa' + (overdue.length === 1 ? ' atrasada precisa' : 's atrasadas precisam') + ' de atenção.'
              : today.length
                ? today.length + ' tarefa' + (today.length === 1 ? '' : 's') + ' para avançar hoje.'
                : 'Seu dia está organizado. Use este espaço para manter o foco.'}
          </p>

          <div className="smart-summary">
            <button type="button" disabled={!nextTask} onClick={() => nextTask && onEdit(nextTask)}>
              <i>→</i>
              <span><small>PRÓXIMA AÇÃO</small><strong>{nextTask?.title || 'Nenhuma tarefa imediata'}</strong></span>
            </button>
            <div><i>◴</i><span><small>CARGA DE HOJE</small><strong>{hours ? hours.toFixed(hours % 1 ? 1 : 0) + 'h planejadas' : 'Sem horas estimadas'}</strong></span></div>
            <div><i>✓</i><span><small>CONCLUÍDAS</small><strong>{doneToday} de {dueTodayAll.length}</strong></span></div>
          </div>
        </div>

        <div className="progress-panel">
          <div className="progress-head">
            <span><small>PROGRESSO DE HOJE</small><strong>{progress}%</strong></span>
            <em>{mood}</em>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress + '%' }} />
            <i className="mark m25" />
            <i className="mark m50" />
            <i className="mark m75" />
          </div>
          <p>{doneToday} de {dueTodayAll.length} tarefas concluídas</p>
        </div>

        <div className="today-pills">
          <button type="button" onClick={() => onOpenTasks('today')}><strong>{today.length}</strong><span>Para hoje</span></button>
          <button type="button" className="danger" onClick={() => onOpenTasks('overdue')}><strong>{overdue.length}</strong><span>Atrasadas</span></button>
          <button type="button" onClick={() => onOpenTasks('waiting')}><strong>{waiting.length}</strong><span>Aguardando</span></button>
        </div>
      </section>

      <div className="today-grid">
        <section className="surface">
          <header className="section-head">
            <div><span className="eyebrow">FOCO AGORA</span><h3>Prioridades do dia</h3></div>
            <span className="count-badge">{focus.length}</span>
          </header>
          <div className="stack">
            {focus.length
              ? focus.slice(0, 4).map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} compact />)
              : <div className="empty-state"><b>✓</b><strong>Nada crítico agora</strong><span>Você está em dia com as prioridades.</span></div>}
          </div>
        </section>

        <section className="surface">
          <header className="section-head">
            <div><span className="eyebrow">PRÓXIMOS 7 DIAS</span><h3>O que vem depois</h3></div>
            <span className="count-badge">{upcoming.length}</span>
          </header>
          <div className="upcoming-list">
            {upcoming.length
              ? upcoming.slice(0, 5).map(task => {
                  const diff = daysDiff(task.due) || 0;
                  return (
                    <button key={task.id} type="button" onClick={() => onEdit(task)}>
                      <span className="date-chip">{diff === 1 ? 'Amanhã' : 'Em ' + diff + ' dias'}</span>
                      <span><strong>{task.title}</strong><small>{task.project || task.area || task.priority}</small></span>
                      <i>›</i>
                    </button>
                  );
                })
              : <div className="empty-state"><b>○</b><strong>Agenda tranquila</strong><span>Nada previsto para os próximos 7 dias.</span></div>}
          </div>
        </section>
      </div>
    </div>
  );
}
