'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { useAppSelector } from '@/store/hooks';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/admin/dashboard');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #f3f4f6',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-100/40 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-100/40 blur-[120px]"
          />
        </div>

        {/* Subtle Pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Login Form */}
        <div className="relative z-10 w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
