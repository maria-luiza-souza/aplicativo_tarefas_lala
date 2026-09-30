import { useEffect, useState, type FormEvent } from 'react';
import type { Reminder, Recurrence, Task, TaskDraft, TaskPriority, TaskStatus } from '../types';
import { todayISO } from '../utils';
import { useWorkspace } from '../workspace';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';

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

const inputClass =
  'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ' +
  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500';

const textareaClass =
  inputClass + ' min-h-28 resize-y py-3 leading-6';

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </span>
      <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}

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

  function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const status = form.status as TaskStatus;

    upsertTask({
      ...form,
      title: form.title.trim(),
      tags: tagsText
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      completedAt: status === 'Concluída' ? form.completedAt || todayISO() : ''
    });

    onClose();
  }

  function deleteTask() {
    if (!task) return;

    if (confirm('Excluir esta tarefa?')) {
      removeTask(task.id);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <form
        className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900"
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-slate-800">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
              {task ? 'Editar tarefa' : 'Nova tarefa'}
            </span>

            <h2
              id="task-modal-title"
              className="mt-1 truncate text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl dark:text-white"
            >
              {task ? task.title : 'Organize uma nova atividade'}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {task
                ? 'Atualize informações, prazo e andamento.'
                : 'Adicione apenas o necessário agora; você pode complementar depois.'}
            </p>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-7">
            <section>
              <SectionTitle
                eyebrow="Essencial"
                title="O que precisa ser feito?"
                description="Defina o título e o estado atual da tarefa."
              />

              <div className="grid gap-4">
                <FormField label="Título">
                  <input
                    autoFocus
                    className={inputClass}
                    value={form.title}
                    onChange={event => update('title', event.target.value)}
                    placeholder="Ex.: Preparar relatório mensal"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Status">
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={event => update('status', event.target.value as TaskStatus)}
                    >
                      <option>Pendente</option>
                      <option>Em Andamento</option>
                      <option>Aguardando</option>
                      <option>Concluída</option>
                    </select>
                  </FormField>

                  <FormField label="Prioridade">
                    <select
                      className={inputClass}
                      value={form.priority}
                      onChange={event => update('priority', event.target.value as TaskPriority)}
                    >
                      <option>Baixa</option>
                      <option>Média</option>
                      <option>Alta</option>
                      <option>Urgente</option>
                    </select>
                  </FormField>
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <SectionTitle
                eyebrow="Planejamento"
                title="Prazo e esforço"
                description="Organize quando a tarefa deve acontecer e quanto tempo pode exigir."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Vencimento">
                  <input
                    className={inputClass}
                    type="date"
                    value={form.due}
                    onChange={event => update('due', event.target.value)}
                  />
                </FormField>

                <FormField label="Horas estimadas">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours}
                    onChange={event => update('hours', Number(event.target.value))}
                  />
                </FormField>

                <FormField label="Recorrência">
                  <select
                    className={inputClass}
                    value={form.recurrence}
                    onChange={event => update('recurrence', event.target.value as Recurrence)}
                  >
                    <option value="none">Sem recorrência</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </FormField>

                <FormField label="Lembrete">
                  <select
                    className={inputClass}
                    value={form.reminder}
                    onChange={event => update('reminder', event.target.value as Reminder)}
                  >
                    <option value="none">Sem lembrete</option>
                    <option value="due">No vencimento</option>
                    <option value="day_before">Um dia antes</option>
                  </select>
                </FormField>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <SectionTitle
                eyebrow="Organização"
                title="Contexto da tarefa"
                description="Use área, projeto e tags para encontrar e agrupar tarefas com facilidade."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Área / setor">
                  <input
                    className={inputClass}
                    value={form.area}
                    onChange={event => update('area', event.target.value)}
                    placeholder="Ex.: Financeiro"
                  />
                </FormField>

                <FormField label="Projeto">
                  <input
                    className={inputClass}
                    value={form.project}
                    onChange={event => update('project', event.target.value)}
                    placeholder="Ex.: Fechamento mensal"
                  />
                </FormField>

                <FormField label="Relacionado a">
                  <input
                    className={inputClass}
                    value={form.related}
                    onChange={event => update('related', event.target.value)}
                    placeholder="Cliente, pessoa ou referência"
                  />
                </FormField>

                <FormField label="Tags" hint="Separe as tags por vírgulas.">
                  <input
                    className={inputClass}
                    value={tagsText}
                    onChange={event => setTagsText(event.target.value)}
                    placeholder="cliente, financeiro, urgente"
                  />
                </FormField>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <SectionTitle
                eyebrow="Detalhes"
                title="Próxima ação e descrição"
                description="Registre contexto suficiente para retomar a tarefa sem perder tempo."
              />

              <div className="grid gap-4">
                <FormField label="Próxima ação">
                  <input
                    className={inputClass}
                    value={form.nextAction}
                    onChange={event => update('nextAction', event.target.value)}
                    placeholder="Ex.: Solicitar aprovação da gestora"
                  />
                </FormField>

                <FormField label="Descrição">
                  <textarea
                    className={textareaClass}
                    value={form.description}
                    onChange={event => update('description', event.target.value)}
                    placeholder="Adicione informações, contexto ou observações importantes."
                  />
                </FormField>
              </div>
            </section>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6 dark:border-slate-800 dark:bg-slate-950/60">
          {task ? (
            <Button type="button" variant="danger" onClick={deleteTask} className="sm:mr-auto">
              Excluir tarefa
            </Button>
          ) : (
            <span className="hidden sm:block sm:mr-auto" />
          )}

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="primary">
            {task ? 'Salvar alterações' : 'Criar tarefa'}
          </Button>
        </footer>
      </form>
    </div>
  );
}
