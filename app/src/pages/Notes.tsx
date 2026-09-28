import { useState } from 'react';
import type { Note } from '../types';
import { useWorkspace } from '../workspace';

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

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() && !body.trim()) return;
    upsertNote({ id: editing?.id, title: title.trim() || 'Sem título', body: body.trim() });
    setOpen(false);
  }

  return (
    <div className="notes-page">
      <div className="notes-toolbar">
        <div><span className="eyebrow">MEMÓRIA DE TRABALHO</span><h2>Anotações rápidas</h2></div>
        <button type="button" className="button primary" onClick={() => start()}>+ Nova anotação</button>
      </div>

      <div className="notes-grid">
        {notes.map(note => (
          <article className="note-card" key={note.id}>
            <button type="button" onClick={() => start(note)}>
              <strong>{note.title}</strong>
              <p>{note.body || 'Sem conteúdo'}</p>
              <small>Atualizada em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}</small>
            </button>
            <button
              type="button"
              className="note-delete"
              onClick={() => confirm('Excluir esta anotação?') && removeNote(note.id)}
              aria-label="Excluir anotação"
            >
              ×
            </button>
          </article>
        ))}
        {!notes.length && <div className="surface empty-state large"><b>✎</b><strong>Nenhuma anotação ainda</strong><span>Crie registros rápidos para não perder contexto.</span></div>}
      </div>

      {open && (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
          <form className="note-modal" onSubmit={save}>
            <div className="modal-head">
              <div><span className="eyebrow">{editing ? 'EDITAR' : 'NOVA'} ANOTAÇÃO</span><h2>Registro rápido</h2></div>
              <button type="button" className="icon-button" onClick={() => setOpen(false)}>×</button>
            </div>
            <label className="field"><span>Título</span><input value={title} onChange={event => setTitle(event.target.value)} autoFocus /></label>
            <label className="field"><span>Conteúdo</span><textarea rows={8} value={body} onChange={event => setBody(event.target.value)} /></label>
            <div className="modal-actions"><span /><button type="button" className="button ghost" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary">Salvar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
