import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadStatusBanner } from '../../src/components/LoadStatusBanner';

describe('LoadStatusBanner', () => {
  it('muestra un indicador de carga cuando status es "loading"', async () => {
    await render(
      <LoadStatusBanner status="loading" successMessage="Listo" errorMessage="Falló" testID="banner" />
    );
    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });

  it('muestra el mensaje de éxito cuando status es "success"', async () => {
    await render(
      <LoadStatusBanner status="success" successMessage="Listo" errorMessage="Falló" testID="banner" />
    );
    expect(screen.getByText('Listo')).toBeTruthy();
  });

  it('muestra el mensaje de error cuando status es "error"', async () => {
    await render(
      <LoadStatusBanner status="error" successMessage="Listo" errorMessage="Falló" testID="banner" />
    );
    expect(screen.getByText('Falló')).toBeTruthy();
  });
});
