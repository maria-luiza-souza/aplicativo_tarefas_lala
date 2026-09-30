import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { priorityRank, toISODateLocal, todayISO } from '../utils';
import { useWorkspace } from '../workspace';
import { TaskCard } from '../components/TaskCard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-w-0 overflow-hidden">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Planejamento
            </span>
            <h2 className="mt-1 text-xl font-semibold capitalize tracking-[-0.025em] text-slate-950 dark:text-white">
              {cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              aria-label="Mês anterior"
            >
              ‹
            </button>

            <button
              type="button"
              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => {
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelected(todayISO());
              }}
            >
              Hoje
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>
        </header>

        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-7">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <span
                key={day}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            {cells.map(cell => {
              const isSelected = cell.iso === selected;
              const isToday = cell.iso === todayISO();

              return (
                <button
                  type="button"
                  key={cell.iso}
                  onClick={() => setSelected(cell.iso)}
                  className={[
                    'relative min-h-[78px] border-b border-r border-slate-200 p-2 text-left transition sm:min-h-[96px] sm:p-2.5',
                    'dark:border-slate-800',
                    cell.outside
                      ? 'bg-slate-50 text-slate-300 dark:bg-slate-950/60 dark:text-slate-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80',
                    isSelected
                      ? 'z-10 ring-2 ring-inset ring-indigo-500'
                      : '',
                    isToday && !isSelected ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : ''
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold',
                      isToday
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : ''
                    ].join(' ')}
                  >
                    {cell.date.getDate()}
                  </span>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {cell.tasks.slice(0, 3).map(task => (
                      <span
                        key={task.id}
                        title={task.title}
                        className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                      />
                    ))}
                    {cell.tasks.length > 3 && (
                      <small className="text-[10px] font-semibold text-slate-400">
                        +{cell.tasks.length - 3}
                      </small>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="h-fit p-5 xl:sticky xl:top-[92px]">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-400">
          Agenda do dia
        </span>

        <h3 className="mt-1 text-lg font-semibold capitalize leading-6 text-slate-950 dark:text-white">
          {selectedDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
          })}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {agenda.length
            ? agenda.length + ' tarefa' + (agenda.length === 1 ? '' : 's') + ' nesta data.'
            : 'Nenhuma tarefa com vencimento nesta data.'}
        </p>

        <div className="mt-4 grid gap-2.5">
          {agenda.length ? (
            agenda.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} compact />
            ))
          ) : (
            <EmptyState
              className="min-h-36"
              icon={<span aria-hidden="true">○</span>}
              title="Dia livre"
              description="Selecione outra data ou aproveite o espaço na agenda."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
