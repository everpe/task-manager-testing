import { useEffect, useState } from 'react';
import { Task } from '../types';
import { fetchTasks, createTask } from '../services/taskService';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useRemoteTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadStatus, setLoadStatus] = useState<Status>('idle');
  const [submitStatus, setSubmitStatus] = useState<Status>('idle');

  const load = async () => {
    setLoadStatus('loading');
    try {
      const remote = await fetchTasks();
      setTasks(remote);
      setLoadStatus('success');
    } catch {
      setLoadStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (title: string) => {
    setSubmitStatus('loading');
    try {
      const task = await createTask(title);
      setTasks((prev) => [...prev, task]);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  };

  return { tasks, loadStatus, submitStatus, load, submit };
}
