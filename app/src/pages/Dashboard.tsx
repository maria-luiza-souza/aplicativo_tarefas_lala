import { useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { TaskFilter } from '../types';
import { daysDiff, parseDateLocal } from '../utils';
import { useWorkspace } from '../workspace';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

type Period = 'all' | 'month' | '30days' | 'year';

function KpiCard({
  label,
  value,
  description,
  danger = false,
  onClick
}: {
  label: string;
  value: string | number;
  description: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const classes = [
    'rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition',
    'dark:border-slate-800 dark:bg-slate-900 dark:shadow-none',
    onClick
      ? 'hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:hover:border-slate-700'
      : ''
  ].join(' ');

  const content = (
    <>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <strong
        className={
          danger
            ? 'mt-2 block text-2xl font-semibold tracking-[-0.035em] text-red-600 dark:text-red-400'
            : 'mt-2 block text-2xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white'
        }
      >
        {value}
      </strong>
      <span className="mt-1 block text-xs leading-5 text-slate-400 dark:text-slate-500">
        {description}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function DashboardPage({
  onOpenTasks,
  theme
}: {
  onOpenTasks: (filter: TaskFilter) => void;
  theme: 'light' | 'dark';
}) {
  const { tasks } = useWorkspace();
  const [period, setPeriod] = useState<Period>('all');

  const chartText = theme === 'dark' ? '#94a3b8' : '#64748b';
  const chartGrid = theme === 'dark' ? 'rgba(148,163,184,.12)' : 'rgba(148,163,184,.18)';
  const chartPanel = theme === 'dark' ? '#0f172a' : '#ffffff';

  const list = useMemo(() => {
    if (period === 'all') return tasks;

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let start = new Date(0);

    if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);

    if (period === '30days') {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    if (period === 'year') start = new Date(now.getFullYear(), 0, 1);

    return tasks.filter(task => {
      const candidates = [
        task.completedAt,
        task.due,
        task.createdAt.slice(0, 10)
      ].filter(Boolean);

      return candidates.some(value => {
        const date = parseDateLocal(value);
        return date && date >= start && date <= now;
      });
    });
  }, [tasks, period]);

  const total = list.length;
  const done = list.filter(task => task.status === 'Concluída').length;
  const progress = list.filter(task => task.status === 'Em Andamento').length;
  const waiting = list.filter(task => task.status === 'Aguardando').length;
  const overdue = list.filter(
    task =>
      task.status !== 'Concluída' &&
      task.due &&
      (daysDiff(task.due) || 0) < 0
  ).length;
  const hours = list.reduce((sum, task) => sum + (Number(task.hours) || 0), 0);
  const rate = total ? Math.round((done / total) * 100) : 0;

  const statusLabels = ['Pendente', 'Em Andamento', 'Aguardando', 'Concluída'];
  const statusData = statusLabels.map(status =>
    list.filter(task => task.status === status).length
  );

  const areaHours: Record<string, number> = {};
  list.forEach(task => {
    const area = task.area || 'Sem área';
    areaHours[area] = (areaHours[area] || 0) + (Number(task.hours) || 0);
  });

  const areaEntries = Object.entries(areaHours)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return date;
  });

  const completionValues = months.map(month =>
    tasks.filter(task => {
      const date = parseDateLocal(task.completedAt);
      return (
        date &&
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth()
      );
    }).length
  );

  const recent = [...tasks]
    .filter(task => task.status === 'Concluída' && task.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 5);

  return (
    <div className="grid gap-5">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-400">
              Visão executiva
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl dark:text-white">
              Panorama do trabalho
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
              {overdue
                ? overdue + ' tarefa' + (overdue === 1 ? ' atrasada merece' : 's atrasadas merecem') + ' atenção.'
                : rate >= 80 && total
                  ? 'Excelente ritmo: a maior parte das tarefas já foi concluída.'
                  : 'Acompanhe produtividade, prioridades e carga de trabalho em um só lugar.'}
            </p>

            <select
              value={period}
              onChange={event => setPeriod(event.target.value as Period)}
              className="mt-4 min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">Visão geral</option>
              <option value="month">Este mês</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          <div className="flex min-w-[180px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="relative h-20 w-20 shrink-0 rounded-full" style={{
              background: `conic-gradient(#4f46e5 ${rate * 3.6}deg, ${theme === 'dark' ? '#1e293b' : '#e2e8f0'} 0deg)`
            }}>
              <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <strong className="text-lg font-semibold text-slate-950 dark:text-white">{rate}%</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Taxa de conclusão</span>
              <strong className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white">
                {done} de {total}
              </strong>
              <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">
                tarefas concluídas
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total" value={total} description="Tarefas no período" onClick={() => onOpenTasks('all')} />
        <KpiCard label="Em andamento" value={progress} description="Execução ativa" onClick={() => onOpenTasks('all')} />
        <KpiCard label="Atrasadas" value={overdue} description="Pedem atenção" danger={overdue > 0} onClick={() => onOpenTasks('overdue')} />
        <KpiCard label="Concluídas" value={done} description={rate + '% de conclusão'} onClick={() => onOpenTasks('done')} />
        <KpiCard label="Aguardando" value={waiting} description="Dependem de retorno" onClick={() => onOpenTasks('waiting')} />
        <KpiCard label="Horas" value={hours.toFixed(1) + 'h'} description="Carga planejada" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <header className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Fluxo
            </span>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              Status das tarefas
            </h3>
          </header>

          <div className="h-[300px]">
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [{
                  data: statusData,
                  backgroundColor: ['#cbd5e1', '#6366f1', '#8b5cf6', '#10b981'],
                  borderColor: chartPanel,
                  borderWidth: 4,
                  hoverOffset: 8
                }]
              }}
              options={{
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: chartText,
                      usePointStyle: true,
                      padding: 18
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <header className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Evolução
            </span>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              Conclusões nos últimos 6 meses
            </h3>
          </header>

          <div className="h-[300px]">
            <Line
              data={{
                labels: months.map(month =>
                  month.toLocaleDateString('pt-BR', { month: 'short' })
                ),
                datasets: [{
                  label: 'Concluídas',
                  data: completionValues,
                  borderColor: '#4f46e5',
                  backgroundColor: 'rgba(79,70,229,.10)',
                  fill: true,
                  tension: .34,
                  pointBackgroundColor: chartPanel,
                  pointBorderColor: '#4f46e5',
                  pointBorderWidth: 2
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: { color: chartText },
                    grid: { display: false },
                    border: { display: false }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: chartText, precision: 0 },
                    grid: { color: chartGrid },
                    border: { display: false }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <header className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Capacidade
            </span>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              Carga estimada por área
            </h3>
          </header>

          {areaEntries.length ? (
            <div className="h-[300px]">
              <Bar
                data={{
                  labels: areaEntries.map(entry => entry[0]),
                  datasets: [{
                    data: areaEntries.map(entry => Number(entry[1].toFixed(1))),
                    backgroundColor: 'rgba(79,70,229,.72)',
                    borderRadius: 6
                  }]
                }}
                options={{
                  indexAxis: 'y',
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { color: chartText },
                      grid: { color: chartGrid },
                      border: { display: false }
                    },
                    y: {
                      ticks: { color: chartText },
                      grid: { display: false },
                      border: { display: false }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <EmptyState
              className="min-h-[300px]"
              icon={<span aria-hidden="true">○</span>}
              title="Sem carga estimada"
              description="Adicione horas às tarefas para visualizar a distribuição por área."
            />
          )}
        </Card>

        <Card className="p-5">
          <header className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Atividade recente
            </span>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              Últimas conclusões
            </h3>
          </header>

          {recent.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map(task => (
                <article key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    ✓
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {task.title}
                    </strong>
                    <small className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                      {new Date(task.completedAt + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </small>
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              className="min-h-[260px]"
              icon={<span aria-hidden="true">○</span>}
              title="Sem conclusões recentes"
              description="As entregas concluídas aparecerão aqui."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
