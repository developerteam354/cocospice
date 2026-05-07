import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ReduxProvider from '@/store/ReduxProvider';
import AuthInitializer from '@/store/AuthInitializer';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Cocospice Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <ReduxProvider>
          <AuthInitializer />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
