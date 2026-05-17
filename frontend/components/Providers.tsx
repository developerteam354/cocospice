'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import ReduxProvider from '../store/ReduxProvider';
import AuthInitializer from '../store/AuthInitializer'; // ✅ Import AuthInitializer
import AuthLoadingWrapper from './AuthLoadingWrapper';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthInitializer /> {/* ✅ Add AuthInitializer to restore session on page refresh */}
      <AuthLoadingWrapper>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </AuthLoadingWrapper>
    </ReduxProvider>
  );
}
