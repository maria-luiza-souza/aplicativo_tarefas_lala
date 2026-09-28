import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from 'react';
import type { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Note, SyncState, Task, TaskDraft, TaskStatus } from './types';
import {
  createId,
  draftToTask,
  nextRecurrenceDate,
  NOTES_KEY,
  normalizeTask,
  TASKS_KEY,
  todayISO
} from './utils';

interface WorkspaceValue {
  tasks: Task[];
  notes: Note[];
  syncState: SyncState;
  upsertTask: (draft: TaskDraft) => void;
  removeTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  toggleTaskDone: (id: string) => void;
  upsertNote: (note: Partial<Note> & { title: string; body: string }) => void;
  removeNote: (id: string) => void;
  replaceWorkspace: (tasks: Task[], notes: Note[]) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function readTasks(): Task[] {
  try {
    const raw = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]') as Partial<Task>[];
    return Array.isArray(raw) ? raw.map(normalizeTask) : [];
  } catch {
    return [];
  }
}

function readNotes(): Note[] {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') as Note[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function WorkspaceProvider({ user, children }: PropsWithChildren<{ user: User }>) {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [notes, setNotes] = useState<Note[]>(readNotes);
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const readyRef = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const lastCloudSignatureRef = useRef('');
  const localSignatureRef = useRef('');

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localSignatureRef.current = JSON.stringify({ tasks, notes });
  }, [tasks, notes]);

  useEffect(() => {
    const workspaceRef = doc(db, 'users', user.uid, 'workspace', 'main');
    let cancelled = false;
    let unsubscribe: () => void = () => {};

    async function start() {
      setSyncState('connecting');
      try {
        const first = await getDoc(workspaceRef);
        if (cancelled) return;

        if (first.exists()) {
          const data = first.data();
          const remoteTasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [];
          const remoteNotes = Array.isArray(data.notes) ? data.notes : [];
          lastCloudSignatureRef.current = JSON.stringify({ tasks: remoteTasks, notes: remoteNotes });
          setTasks(remoteTasks);
          setNotes(remoteNotes);
        } else {
          await setDoc(workspaceRef, {
            tasks,
            notes,
            version: 4,
            updatedAt: serverTimestamp()
          });
          lastCloudSignatureRef.current = JSON.stringify({ tasks, notes });
        }

        readyRef.current = true;
        setSyncState('synced');

        unsubscribe = onSnapshot(
          workspaceRef,
          snapshot => {
            if (!snapshot.exists()) return;
            const data = snapshot.data();
            const remoteTasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [];
            const remoteNotes = Array.isArray(data.notes) ? data.notes : [];
            const remoteSignature = JSON.stringify({ tasks: remoteTasks, notes: remoteNotes });

            lastCloudSignatureRef.current = remoteSignature;

            if (remoteSignature !== localSignatureRef.current) {
              setTasks(remoteTasks);
              setNotes(remoteNotes);
            }

            setSyncState('synced');
          },
          () => {
            readyRef.current = false;
            setSyncState('local');
          }
        );
      } catch {
        readyRef.current = false;
        setSyncState('local');
      }
    }

    void start();

    return () => {
      cancelled = true;
      unsubscribe();
      readyRef.current = false;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [user.uid]);

  useEffect(() => {
    if (!readyRef.current) return;

    const signature = JSON.stringify({ tasks, notes });
    if (signature === lastCloudSignatureRef.current) {
      setSyncState('synced');
      return;
    }

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    setSyncState('saving');
    saveTimer.current = window.setTimeout(async () => {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'workspace', 'main'),
          {
            tasks,
            notes,
            version: 4,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        lastCloudSignatureRef.current = signature;
        setSyncState('synced');
      } catch {
        setSyncState('local');
      }
    }, 450);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [tasks, notes, user.uid]);

  function upsertTask(draft: TaskDraft) {
    setTasks(current => {
      const existing = draft.id ? current.find(task => task.id === draft.id) : undefined;
      const next = draftToTask(draft, existing);

      const becomingDone = existing?.status !== 'Concluída' && next.status === 'Concluída';
      if (next.status === 'Concluída' && !next.completedAt) next.completedAt = todayISO();
      if (next.status !== 'Concluída') next.completedAt = '';

      let result = existing
        ? current.map(task => (task.id === next.id ? next : task))
        : [next, ...current];

      if (becomingDone && next.recurrence !== 'none' && !next.recurrenceGeneratedFor) {
        const generatedDue = nextRecurrenceDate(next.due || todayISO(), next.recurrence);
        const completedVersion = { ...next, recurrenceGeneratedFor: generatedDue };
        const future = normalizeTask({
          ...next,
          id: createId(),
          status: 'Pendente',
          due: generatedDue,
          completedAt: '',
          recurrenceGeneratedFor: '',
          checklist: next.checklist.map(item => ({ ...item, done: false })),
          createdAt: new Date().toISOString()
        });

        result = result.map(task => (task.id === next.id ? completedVersion : task));
        result.unshift(future);
      }

      return result;
    });
  }

  function removeTask(id: string) {
    setTasks(current => current.filter(task => task.id !== id));
  }

  function setTaskStatus(id: string, status: TaskStatus) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    upsertTask({
      ...task,
      status,
      completedAt: status === 'Concluída' ? task.completedAt || todayISO() : ''
    });
  }

  function toggleTaskDone(id: string) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    setTaskStatus(id, task.status === 'Concluída' ? 'Pendente' : 'Concluída');
  }

  function upsertNote(note: Partial<Note> & { title: string; body: string }) {
    setNotes(current => {
      const existing = note.id ? current.find(item => item.id === note.id) : undefined;
      const now = new Date().toISOString();
      const next: Note = {
        id: note.id || createId(),
        title: note.title,
        body: note.body,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };
      return existing
        ? current.map(item => (item.id === next.id ? next : item))
        : [next, ...current];
    });
  }

  function removeNote(id: string) {
    setNotes(current => current.filter(note => note.id !== id));
  }

  function replaceWorkspace(nextTasks: Task[], nextNotes: Note[]) {
    setTasks(nextTasks.map(normalizeTask));
    setNotes(Array.isArray(nextNotes) ? nextNotes : []);
  }

  const value = useMemo<WorkspaceValue>(
    () => ({
      tasks,
      notes,
      syncState,
      upsertTask,
      removeTask,
      setTaskStatus,
      toggleTaskDone,
      upsertNote,
      removeNote,
      replaceWorkspace
    }),
    [tasks, notes, syncState]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace precisa estar dentro de WorkspaceProvider.');
  return value;
}
