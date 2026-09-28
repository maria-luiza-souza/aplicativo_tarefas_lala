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

export function DashboardPage({
  onOpenTasks,
  theme
}: {
  onOpenTasks: (filter: TaskFilter) => void;
  theme: 'light' | 'dark';
}) {
  const { tasks } = useWorkspace();
  const [period, setPeriod] = useState<Period>('all');
  const chartText = theme === 'dark' ? '#b7c2cb' : '#667078';
  const chartGrid = theme === 'dark' ? 'rgba(145,160,171,.16)' : 'rgba(112,124,132,.12)';
  const chartPanel = theme === 'dark' ? '#182129' : '#ffffff';

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
      const candidates = [task.completedAt, task.due, task.createdAt.slice(0, 10)].filter(Boolean);
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
  const overdue = list.filter(task => task.status !== 'Concluída' && task.due && (daysDiff(task.due) || 0) < 0).length;
  const hours = list.reduce((sum, task) => sum + (Number(task.hours) || 0), 0);
  const rate = total ? Math.round((done / total) * 100) : 0;

  const statusLabels = ['Pendente', 'Em Andamento', 'Aguardando', 'Concluída'];
  const statusData = statusLabels.map(status => list.filter(task => task.status === status).length);

  const areaHours: Record<string, number> = {};
  list.forEach(task => {
    const area = task.area || 'Sem área';
    areaHours[area] = (areaHours[area] || 0) + (Number(task.hours) || 0);
  });
  const areaEntries = Object.entries(areaHours).sort((a, b) => b[1] - a[1]).slice(0, 7);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return date;
  });
  const completionValues = months.map(month =>
    tasks.filter(task => {
      const date = parseDateLocal(task.completedAt);
      return date && date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    }).length
  );

  const recent = [...tasks]
    .filter(task => task.status === 'Concluída' && task.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow light">VISÃO EXECUTIVA</span>
          <h2>Panorama do trabalho</h2>
          <p>
            {overdue
              ? overdue + ' tarefa' + (overdue === 1 ? ' atrasada merece' : 's atrasadas merecem') + ' atenção.'
              : rate >= 80 && total
                ? 'Excelente ritmo: a maior parte das tarefas já foi concluída.'
                : 'Acompanhe produtividade, prioridades e carga de trabalho em um só lugar.'}
          </p>
          <select value={period} onChange={event => setPeriod(event.target.value as Period)}>
            <option value="all">Visão geral</option>
            <option value="month">Este mês</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="year">Este ano</option>
          </select>
        </div>
        <div className="dashboard-ring" style={{ '--progress': rate } as React.CSSProperties}>
          <div><strong>{rate}%</strong><span>conclusão</span></div>
        </div>
      </section>

      <div className="kpi-grid">
        <button type="button" onClick={() => onOpenTasks('all')}><small>Total</small><strong>{total}</strong><span>Tarefas no período</span></button>
        <button type="button" onClick={() => onOpenTasks('all')}><small>Em andamento</small><strong>{progress}</strong><span>Execução ativa</span></button>
        <button type="button" className="danger" onClick={() => onOpenTasks('overdue')}><small>Atrasadas</small><strong>{overdue}</strong><span>Pedem atenção</span></button>
        <button type="button" onClick={() => onOpenTasks('done')}><small>Concluídas</small><strong>{done}</strong><span>{rate}% de conclusão</span></button>
        <button type="button" onClick={() => onOpenTasks('waiting')}><small>Aguardando</small><strong>{waiting}</strong><span>Dependem de retorno</span></button>
        <button type="button"><small>Horas</small><strong>{hours.toFixed(1)}h</strong><span>Carga planejada</span></button>
      </div>

      <div className="dashboard-grid">
        <section className="surface chart-card">
          <header><span className="eyebrow">FLUXO</span><h3>Status das tarefas</h3></header>
          <div className="chart-wrap">
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [{
                  data: statusData,
                  backgroundColor: ['#e7c68d', '#7692aa', '#aa96b5', '#82b399'],
                  borderColor: chartPanel,
                  borderWidth: 4,
                  hoverOffset: 10
                }]
              }}
              options={{
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: chartText, usePointStyle: true }
                  }
                }
              }}
            />
          </div>
        </section>

        <section className="surface chart-card">
          <header><span className="eyebrow">EVOLUÇÃO</span><h3>Conclusões nos últimos 6 meses</h3></header>
          <div className="chart-wrap">
            <Line
              data={{
                labels: months.map(month => month.toLocaleDateString('pt-BR', { month: 'short' })),
                datasets: [{
                  label: 'Concluídas',
                  data: completionValues,
                  borderColor: '#d86b7d',
                  backgroundColor: 'rgba(216,107,125,.12)',
                  fill: true,
                  tension: .38,
                  pointBackgroundColor: '#ffffff',
                  pointBorderColor: '#d86b7d',
                  pointBorderWidth: 3
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: chartText }, grid: { display: false } },
                  y: { ticks: { color: chartText }, grid: { color: chartGrid } }
                }
              }}
            />
          </div>
        </section>

        <section className="surface chart-card">
          <header><span className="eyebrow">CAPACIDADE</span><h3>Carga estimada por área</h3></header>
          <div className="chart-wrap">
            <Bar
              data={{
                labels: areaEntries.map(entry => entry[0]),
                datasets: [{
                  data: areaEntries.map(entry => Number(entry[1].toFixed(1))),
                  backgroundColor: 'rgba(118,146,170,.75)',
                  borderRadius: 9
                }]
              }}
              options={{
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { beginAtZero: true, ticks: { color: chartText }, grid: { color: chartGrid } },
                  y: { ticks: { color: chartText }, grid: { display: false } }
                }
              }}
            />
          </div>
        </section>

        <section className="surface recent-card">
          <header><span className="eyebrow">ATIVIDADE RECENTE</span><h3>Últimas conclusões</h3></header>
          <div>
            {recent.length
              ? recent.map(task => (
                  <article key={task.id}>
                    <i>✓</i>
                    <span><strong>{task.title}</strong><small>{new Date(task.completedAt + 'T12:00:00').toLocaleDateString('pt-BR')}</small></span>
                  </article>
                ))
              : <div className="empty-state"><b>○</b><strong>Sem conclusões recentes</strong><span>As entregas concluídas aparecerão aqui.</span></div>}
          </div>
        </section>
      </div>
    </div>
  );
}
