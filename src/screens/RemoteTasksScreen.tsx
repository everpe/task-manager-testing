import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { LoadStatusBanner } from '../components/LoadStatusBanner';
import { useRemoteTasks } from '../hooks/useRemoteTasks';

export function RemoteTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, loadStatus, submitStatus, submit } = useRemoteTasks();

  return (
    <View
      className="flex-1 gap-4 bg-gray-50 p-4"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <Text className="text-2xl font-bold text-gray-900">Tareas remotas</Text>

      <TaskForm onSubmit={submit} />

      {submitStatus !== 'idle' && (
        <LoadStatusBanner
          status={submitStatus}
          successMessage="Tarea creada exitosamente"
          errorMessage="Error al crear la tarea"
          testID="submit-status-banner"
        />
      )}

      {(loadStatus === 'loading' || loadStatus === 'error') && (
        <LoadStatusBanner
          status={loadStatus}
          successMessage=""
          errorMessage="Error al obtener las tareas"
          testID="load-status-banner"
        />
      )}
      {loadStatus === 'success' && <TaskList tasks={tasks} />}
    </View>
  );
}
