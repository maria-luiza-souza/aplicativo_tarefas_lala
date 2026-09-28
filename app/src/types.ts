export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Aguardando' | 'Concluída';
export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type Reminder = 'none' | 'due' | 'day_before';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  area: string;
  project: string;
  related: string;
  due: string;
  completedAt: string;
  hours: number;
  tags: string[];
  nextAction: string;
  description: string;
  checklist: ChecklistItem[];
  recurrence: Recurrence;
  reminder: Reminder;
  recurrenceGeneratedFor: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewKey = 'today' | 'tasks' | 'kanban' | 'calendar' | 'notes' | 'dashboard';
export type TaskFilter = 'all' | 'today' | 'overdue' | 'week' | 'done' | 'waiting';

export interface TaskDraft extends Omit<Task, 'id' | 'createdAt' | 'recurrenceGeneratedFor'> {
  id?: string;
  createdAt?: string;
  recurrenceGeneratedFor?: string;
}

export type SyncState = 'local' | 'connecting' | 'saving' | 'synced';
