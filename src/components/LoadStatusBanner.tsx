import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export type BannerStatus = 'loading' | 'success' | 'error';

interface LoadStatusBannerProps {
  status: BannerStatus;
  successMessage: string;
  errorMessage: string;
  testID?: string;
}

const STYLES: Record<BannerStatus, string> = {
  loading: '',
  success: 'rounded-lg bg-green-100 px-4 py-3 text-sm font-medium text-green-800',
  error: 'rounded-lg bg-red-100 px-4 py-3 text-sm font-medium text-red-800',
};

/**
 * Banner de estado reutilizable: muestra un spinner mientras carga, un
 * mensaje verde en éxito o uno rojo en error. Se extrajo de RemoteTasksScreen
 * para no repetir el mismo bloque condicional para el estado de carga inicial
 * y el estado de envío del formulario.
 */
export function LoadStatusBanner({ status, successMessage, errorMessage, testID }: LoadStatusBannerProps) {
  if (status === 'loading') {
    return <ActivityIndicator testID={testID} accessibilityLabel="Cargando" />;
  }
  if (status === 'success') {
    return (
      <Text testID={testID} className={STYLES.success}>
        {successMessage}
      </Text>
    );
  }
  return (
    <Text testID={testID} className={STYLES.error}>
      {errorMessage}
    </Text>
  );
}
