'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
    outline:
      'border-2 border-primary text-primary hover:bg-primary/10 disabled:opacity-50',
    ghost: 'text-primary hover:bg-primary/10 disabled:opacity-50',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    />
  );
}
