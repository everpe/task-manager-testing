import { useState } from 'react';
import { Task } from '../types';

// ponytail: tareas solo en memoria, se pierden al cerrar la app
export function useCreateTask() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [tasks, setTasks] = useState<Task[]>([]);

  const submit = async (title: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title: title,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
    setStatus('success');
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      )
    );
  };

  return { status, tasks, submit, removeTask, toggleTask };
}
