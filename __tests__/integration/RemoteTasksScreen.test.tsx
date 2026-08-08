import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { http, HttpResponse } from 'msw';
import { server } from '../../src/mocks/server';
import { RemoteTasksScreen } from '../../src/screens/RemoteTasksScreen';

const API_URL = 'https://api.taskmanager.com';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <RemoteTasksScreen />
    </SafeAreaProvider>
  );

describe('RemoteTasksScreen - Integración', () => {
  // Esta pantalla es el punto de integración real entre TaskForm, TaskList,
  // useRemoteTasks y taskService: nada se mockea entre ellos, solo la API
  // externa vía MSW (server.ts / handlers.ts), que es la única dependencia
  // que no existe de verdad en el entorno de pruebas.

  it('escenario de datos vacíos: al montar, la API no tiene tareas y se muestra la lista vacía', async () => {
    // El handler por defecto arranca con un array en memoria vacío (resetTasks
    // se llama en afterEach de jest.setup.js), así que este es el estado base.
    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('No hay tareas aún')).toBeTruthy();
    });
  }, 15000);

  it('escenario de éxito: crea una tarea contra la API real (mockeada) y actualiza la UI', async () => {
    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('No hay tareas aún')).toBeTruthy();
    });

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Tarea remota de prueba'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Tarea creada exitosamente')).toBeTruthy();
    });
    expect(screen.getByText('Tarea remota de prueba')).toBeTruthy();
  }, 15000);

  it('escenario de error: la API responde 500 al cargar y se muestra el mensaje de error', async () => {
    server.use(
      http.get(`${API_URL}/tasks`, () => new HttpResponse(null, { status: 500 }))
    );

    await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Error al obtener las tareas')).toBeTruthy();
    });
    expect(screen.queryByText('No hay tareas aún')).toBeNull();
  }, 15000);
});
