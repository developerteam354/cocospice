'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 w-full ${containerClassName}`}>
        {label && (
          <label className="text-[0.95rem] font-bold text-gray-700">{label}</label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-4 text-gray-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            className={[
              'w-full rounded-2xl border bg-gray-50 px-4 py-3 text-[0.95rem] font-medium text-gray-900',
              'placeholder:text-gray-400 outline-none transition-all duration-200 shadow-sm',
              'focus:bg-white focus:ring-2 focus:ring-[#10b981]/30 focus:border-[#10b981]',
              error ? 'border-red-500/60' : 'border-gray-200',
              leftIcon ? 'pl-11' : '',
              rightIcon ? 'pr-11' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-4 text-gray-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs font-bold text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
