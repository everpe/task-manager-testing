import { renderHook, act } from '@testing-library/react-native';
import { useCreateTask } from '../../src/hooks/useCreateTask';

describe('useCreateTask', () => {
  it('crea la tarea en memoria', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea 1');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Tarea 1');
    expect(result.current.status).toBe('success');
  });

  it('alterna el estado de una tarea entre pendiente y completada', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea 1');
    });
    const id = result.current.tasks[0].id;
    expect(result.current.tasks[0].status).toBe('pending');

    await act(() => {
      result.current.toggleTask(id);
    });
    expect(result.current.tasks[0].status).toBe('completed');

    await act(() => {
      result.current.toggleTask(id);
    });
    expect(result.current.tasks[0].status).toBe('pending');
  });

  it('no conserva las tareas entre montajes', async () => {
    const first = await renderHook(() => useCreateTask());
    await act(async () => {
      await first.result.current.submit('Efímera');
    });

    const second = await renderHook(() => useCreateTask());
    expect(second.result.current.tasks).toHaveLength(0);
  });
});
