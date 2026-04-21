import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export function Button({ className, fullWidth = true, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}

