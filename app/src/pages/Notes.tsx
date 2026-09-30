import { useState, type FormEvent } from 'react';
import type { Note } from '../types';
import { useWorkspace } from '../workspace';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';

const inputClass =
  'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ' +
  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500';

export function NotesPage() {
  const { notes, upsertNote, removeNote } = useWorkspace();
  const [editing, setEditing] = useState<Note | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function start(note?: Note) {
    setEditing(note || null);
    setTitle(note?.title || '');
    setBody(note?.body || '');
    setOpen(true);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() && !body.trim()) return;

    upsertNote({
      id: editing?.id,
      title: title.trim() || 'Sem título',
      body: body.trim()
    });

    setOpen(false);
  }

  function remove(id: string) {
    if (confirm('Excluir esta anotação?')) {
      removeNote(id);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
            Memória de trabalho
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
            Anotações rápidas
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registre contexto, ideias e informações que você precisa retomar depois.
          </p>
        </div>

        <Button variant="primary" onClick={() => start()} className="w-full sm:w-auto">
          + Nova anotação
        </Button>
      </div>

      {notes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map(note => (
            <Card
              key={note.id}
              className="group relative min-h-[190px] overflow-hidden transition hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
            >
              <button
                type="button"
                className="flex h-full min-h-[190px] w-full flex-col p-5 text-left"
                onClick={() => start(note)}
              >
                <div className="pr-8">
                  <strong className="block truncate text-base font-semibold text-slate-950 dark:text-white">
                    {note.title}
                  </strong>

                  <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {note.body || 'Sem conteúdo'}
                  </p>
                </div>

                <small className="mt-auto pt-5 text-xs text-slate-400 dark:text-slate-500">
                  Atualizada em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </small>
              </button>

              <button
                type="button"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-sm text-slate-400 opacity-0 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                onClick={() => remove(note.id)}
                aria-label="Excluir anotação"
              >
                ×
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<span aria-hidden="true">✎</span>}
          title="Nenhuma anotação ainda"
          description="Crie registros rápidos para não perder contexto."
        />
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={event => event.target === event.currentTarget && setOpen(false)}
        >
          <form
            className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900"
            onSubmit={save}
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-title"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
                  {editing ? 'Editar anotação' : 'Nova anotação'}
                </span>

                <h2
                  id="note-modal-title"
                  className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white"
                >
                  Registro rápido
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Salve contexto suficiente para encontrar a informação depois.
                </p>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-5 py-5 sm:px-6">
              <FormField label="Título">
                <input
                  className={inputClass}
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  autoFocus
                  placeholder="Ex.: Ideias para a próxima reunião"
                />
              </FormField>

              <FormField label="Conteúdo">
                <textarea
                  className={inputClass + ' min-h-64 resize-y py-3 leading-6'}
                  value={body}
                  onChange={event => setBody(event.target.value)}
                  placeholder="Escreva sua anotação..."
                />
              </FormField>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-slate-800 dark:bg-slate-950/60">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editing ? 'Salvar alterações' : 'Salvar anotação'}
              </Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
