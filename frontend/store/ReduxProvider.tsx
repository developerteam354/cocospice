'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ThreeDot } from 'react-loading-indicators';
import AuthInitializer from './AuthInitializer';

/** Shown while redux-persist rehydrates from localStorage */
function RehydratingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      background: 'var(--bg-color, #fff)',
    }}>
      <ThreeDot color="#ff6b35" size="medium" />
    </div>
  );
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <PersistGate loading={<RehydratingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
