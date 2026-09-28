import type { Recurrence, Task, TaskDraft } from './types';

export const TASKS_KEY = 'workspace_tasks_v2';
export const NOTES_KEY = 'workspace_notes_v2';

export function createId(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export function parseDateLocal(value?: string): Date | null {
  if (!value) return null;
  const parts = value.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function daysDiff(value?: string): number | null {
  const target = parseDateLocal(value);
  if (!target) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function fmtDate(value?: string): string {
  const date = parseDateLocal(value);
  if (!date) return 'Sem data';
  return date.toLocaleDateString('pt-BR');
}

export function priorityRank(priority: Task['priority']): number {
  return { Urgente: 0, Alta: 1, Média: 2, Baixa: 3 }[priority];
}

export function normalizeTask(input: Partial<Task>): Task {
  return {
    id: input.id || createId(),
    title: input.title || 'Sem título',
    status: input.status || 'Pendente',
    priority: input.priority || 'Média',
    area: input.area || '',
    project: input.project || '',
    related: input.related || '',
    due: input.due || '',
    completedAt: input.completedAt || '',
    hours: Number(input.hours) || 0,
    tags: Array.isArray(input.tags) ? input.tags : [],
    nextAction: input.nextAction || '',
    description: input.description || '',
    checklist: Array.isArray(input.checklist) ? input.checklist : [],
    recurrence: input.recurrence || 'none',
    reminder: input.reminder || 'none',
    recurrenceGeneratedFor: input.recurrenceGeneratedFor || '',
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function draftToTask(draft: TaskDraft, existing?: Task): Task {
  return normalizeTask({
    ...existing,
    ...draft,
    id: draft.id || existing?.id || createId(),
    createdAt: draft.createdAt || existing?.createdAt || new Date().toISOString()
  });
}

export function nextRecurrenceDate(value: string, recurrence: Recurrence): string {
  const date = parseDateLocal(value) || new Date();
  if (recurrence === 'daily') date.setDate(date.getDate() + 1);
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7);
  if (recurrence === 'monthly') date.setMonth(date.getMonth() + 1);
  return toISODateLocal(date);
}
