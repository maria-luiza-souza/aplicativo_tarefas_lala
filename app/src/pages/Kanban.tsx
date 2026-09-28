import type { Task, TaskStatus } from '../types';
import { useWorkspace } from '../workspace';

const columns: TaskStatus[] = ['Pendente', 'Em Andamento', 'Aguardando', 'Concluída'];

export function KanbanPage({ onEdit }: { onEdit: (task: Task) => void }) {
  const { tasks, setTaskStatus } = useWorkspace();

  return (
    <div className="kanban-board">
      {columns.map(status => {
        const items = tasks.filter(task => task.status === status);
        return (
          <section
            className="kanban-column"
            key={status}
            onDragOver={event => event.preventDefault()}
            onDrop={event => {
              const id = event.dataTransfer.getData('text/plain');
              if (id) setTaskStatus(id, status);
            }}
          >
            <header>
              <div><i className={'kanban-dot dot-' + status.replaceAll(' ', '-').toLowerCase()} /><strong>{status}</strong></div>
              <span>{items.length}</span>
            </header>

            <div className="kanban-stack">
              {items.map(task => (
                <article key={task.id} className="kanban-card" draggable onDragStart={event => event.dataTransfer.setData('text/plain', task.id)}>
                  <button type="button" className="kanban-card-main" onClick={() => onEdit(task)}>
                    <span className={'priority priority-' + task.priority.toLowerCase()}>{task.priority}</span>
                    <strong>{task.title}</strong>
                    <small>{task.project || task.area || 'Sem projeto'}</small>
                  </button>

                  <select aria-label="Mover tarefa" value={task.status} onChange={event => setTaskStatus(task.id, event.target.value as TaskStatus)}>
                    {columns.map(option => <option key={option}>{option}</option>)}
                  </select>
                </article>
              ))}
              {!items.length && <div className="kanban-empty">Solte tarefas aqui</div>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
