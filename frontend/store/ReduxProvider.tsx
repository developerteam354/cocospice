'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import LogoPreloader from '@/components/LogoPreloader/LogoPreloader';
import AuthInitializer from './AuthInitializer';

/** Shown while redux-persist rehydrates from localStorage */
function RehydratingScreen() {
  return <LogoPreloader />;
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
