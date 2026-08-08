import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ConfirmDeleteDialog } from '../../src/components/ConfirmDeleteDialog';

const noop = () => {};

describe('ConfirmDeleteDialog - Accesibilidad', () => {
  it('el botón de confirmar tiene accessibilityRole="button" y un accessibilityLabel descriptivo', async () => {
    await render(
      <ConfirmDeleteDialog visible taskTitle="Comprar leche" onConfirm={noop} onCancel={noop} />
    );
    const confirmButton = screen.getByLabelText('Confirmar eliminación');
    // jest-native: toHaveProp verifica un prop específico del elemento renderizado,
    // útil para confirmar que el rol accesible fue asignado correctamente.
    expect(confirmButton).toHaveProp('accessibilityRole', 'button');
    expect(confirmButton).toBeOnTheScreen();
  });

  it('el botón de cancelar es distinguible del de confirmar por su accessibilityLabel', async () => {
    await render(
      <ConfirmDeleteDialog visible taskTitle="Comprar leche" onConfirm={noop} onCancel={noop} />
    );
    const cancelButton = screen.getByLabelText('Cancelar');
    expect(cancelButton).toHaveProp('accessibilityRole', 'button');
    // Dos botones con accessibilityLabel distinto evitan que un lector de
    // pantalla anuncie ambos como "Botón" sin poder diferenciarlos.
    expect(screen.getByLabelText('Confirmar eliminación')).not.toBe(cancelButton);
  });
});
