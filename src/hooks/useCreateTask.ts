import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const STORAGE_KEY = 'tasks';

export function useCreateTask() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [tasks, setTasks] = useState<Task[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTasks(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    // ponytail: no guardar antes de terminar de cargar, si no el [] inicial pisa lo guardado
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(() => {});
  }, [tasks]);

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
