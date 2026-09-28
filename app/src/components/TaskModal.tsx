import { useEffect, useState } from 'react';
import type { Reminder, Recurrence, Task, TaskDraft, TaskPriority, TaskStatus } from '../types';
import { todayISO } from '../utils';
import { useWorkspace } from '../workspace';

const emptyTask: TaskDraft = {
  title: '',
  status: 'Pendente',
  priority: 'Média',
  area: '',
  project: '',
  related: '',
  due: '',
  completedAt: '',
  hours: 0,
  tags: [],
  nextAction: '',
  description: '',
  checklist: [],
  recurrence: 'none',
  reminder: 'none'
};

export function TaskModal({
  open,
  task,
  onClose
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}) {
  const { upsertTask, removeTask } = useWorkspace();
  const [form, setForm] = useState<TaskDraft>(emptyTask);
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({ ...task });
      setTagsText(task.tags.join(', '));
    } else {
      setForm({ ...emptyTask });
      setTagsText('');
    }
  }, [open, task]);

  if (!open) return null;

  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const status = form.status as TaskStatus;
    upsertTask({
      ...form,
      title: form.title.trim(),
      tags: tagsText.split(',').map(item => item.trim()).filter(Boolean),
      completedAt: status === 'Concluída' ? form.completedAt || todayISO() : ''
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <form className="task-modal" onSubmit={save}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">{task ? 'EDITAR TAREFA' : 'NOVA TAREFA'}</span>
            <h2>{task ? task.title : 'Organize uma nova atividade'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <label className="field field-full">
          <span>Título</span>
          <input autoFocus value={form.title} onChange={event => update('title', event.target.value)} placeholder="O que precisa ser feito?" />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Status</span>
            <select value={form.status} onChange={event => update('status', event.target.value as TaskStatus)}>
              <option>Pendente</option>
              <option>Em Andamento</option>
              <option>Aguardando</option>
              <option>Concluída</option>
            </select>
          </label>

          <label className="field">
            <span>Prioridade</span>
            <select value={form.priority} onChange={event => update('priority', event.target.value as TaskPriority)}>
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Urgente</option>
            </select>
          </label>

          <label className="field">
            <span>Vencimento</span>
            <input type="date" value={form.due} onChange={event => update('due', event.target.value)} />
          </label>

          <label className="field">
            <span>Horas estimadas</span>
            <input type="number" min="0" step="0.5" value={form.hours} onChange={event => update('hours', Number(event.target.value))} />
          </label>

          <label className="field">
            <span>Área / setor</span>
            <input value={form.area} onChange={event => update('area', event.target.value)} />
          </label>

          <label className="field">
            <span>Projeto</span>
            <input value={form.project} onChange={event => update('project', event.target.value)} />
          </label>

          <label className="field">
            <span>Recorrência</span>
            <select value={form.recurrence} onChange={event => update('recurrence', event.target.value as Recurrence)}>
              <option value="none">Sem recorrência</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </label>

          <label className="field">
            <span>Lembrete</span>
            <select value={form.reminder} onChange={event => update('reminder', event.target.value as Reminder)}>
              <option value="none">Sem lembrete</option>
              <option value="due">No vencimento</option>
              <option value="day_before">Um dia antes</option>
            </select>
          </label>

          <label className="field field-full">
            <span>Tags</span>
            <input value={tagsText} onChange={event => setTagsText(event.target.value)} placeholder="cliente, financeiro, urgente..." />
          </label>

          <label className="field field-full">
            <span>Próxima ação</span>
            <input value={form.nextAction} onChange={event => update('nextAction', event.target.value)} placeholder="Próximo passo objetivo" />
          </label>

          <label className="field field-full">
            <span>Descrição</span>
            <textarea value={form.description} onChange={event => update('description', event.target.value)} />
          </label>
        </div>

        <div className="modal-actions">
          {task && (
            <button type="button" className="button danger" onClick={() => {
              if (confirm('Excluir esta tarefa?')) {
                removeTask(task.id);
                onClose();
              }
            }}>Excluir</button>
          )}
          <span />
          <button type="button" className="button ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="button primary">Salvar tarefa</button>
        </div>
      </form>
    </div>
  );
}
