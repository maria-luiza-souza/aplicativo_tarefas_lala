import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { priorityRank, toISODateLocal, todayISO } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';

export function CalendarPage({ onEdit }: { onEdit: (task: Task) => void }) {
  const { tasks } = useWorkspace();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(todayISO());

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = toISODateLocal(date);
      return {
        date,
        iso,
        outside: date.getMonth() !== cursor.getMonth(),
        tasks: tasks.filter(task => task.due === iso)
      };
    });
  }, [cursor, tasks]);

  const agenda = tasks
    .filter(task => task.due === selected)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));

  const selectedDate = new Date(selected + 'T12:00:00');

  return (
    <div className="calendar-layout">
      <section className="surface calendar-card">
        <header className="calendar-head">
          <div>
            <span className="eyebrow">PLANEJAMENTO</span>
            <h3>{cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
          </div>
          <div>
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
            <button type="button" onClick={() => setCursor(new Date(now.getFullYear(), now.getMonth(), 1))}>Hoje</button>
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
          </div>
        </header>

        <div className="calendar-weekdays">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <span key={day}>{day}</span>)}
        </div>

        <div className="calendar-grid">
          {cells.map(cell => (
            <button
              type="button"
              key={cell.iso}
              className={[
                'calendar-day',
                cell.outside ? 'outside' : '',
                cell.iso === selected ? 'selected' : '',
                cell.iso === todayISO() ? 'today' : ''
              ].join(' ')}
              onClick={() => setSelected(cell.iso)}
            >
              <strong>{cell.date.getDate()}</strong>
              <span>
                {cell.tasks.slice(0, 2).map(task => <i key={task.id} title={task.title} />)}
              </span>
              {cell.tasks.length > 2 && <small>+{cell.tasks.length - 2}</small>}
            </button>
          ))}
        </div>
      </section>

      <aside className="surface calendar-agenda">
        <span className="eyebrow">AGENDA DO DIA</span>
        <h3>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
        <div className="stack">
          {agenda.length
            ? agenda.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} compact />)
            : <div className="empty-state"><b>○</b><strong>Dia livre</strong><span>Nenhuma tarefa com vencimento nesta data.</span></div>}
        </div>
      </aside>
    </div>
  );
}
