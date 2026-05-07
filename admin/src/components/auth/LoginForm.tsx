'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAdmin } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const loading  = useAppSelector((state: RootState) => state.auth.loading);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to intended destination after login
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const redirectTo = searchParams?.get('from') ?? '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginAdmin(data));

    if (loginAdmin.fulfilled.match(result)) {
      toast.success('Welcome back!');
      router.push(redirectTo);
    } else {
      const message =
        typeof result.payload === 'string' ? result.payload : 'Login failed';
      toast.error(message);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Card */}
      <div className="rounded-[32px] border border-white bg-white/70 backdrop-blur-xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50 border border-emerald-100 shadow-sm">
            <ShieldCheck size={32} className="text-emerald-600" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-[1.8rem] font-bold text-gray-900 tracking-tight leading-tight">Admin Portal</h1>
            <p className="mt-2 text-[0.95rem] font-medium text-gray-500">Sign in to manage your restaurant</p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <motion.div variants={itemVariants}>
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@cocospice.com"
              autoComplete="email"
              leftIcon={<Mail size={20} className="text-gray-400" />}
              error={errors.email?.message}
              {...register('email')}
              className="rounded-2xl"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={20} className="text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors mr-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
              className="rounded-2xl"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button 
              type="submit" 
              loading={loading} 
              className="w-full py-4 text-[1rem] font-bold shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
            >
              Sign In to Dashboard
            </Button>
          </motion.div>
        </form>
      </div>

      <motion.p variants={itemVariants} className="mt-8 text-center text-[0.85rem] font-bold text-gray-400">
        Cocospice Admin Panel &copy; {new Date().getFullYear()}
      </motion.p>
    </motion.div>
  );
}
