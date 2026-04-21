import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Notice({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error' | 'success';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl px-4 py-3 text-sm',
        tone === 'neutral' && 'bg-brand-50 text-brand-700',
        tone === 'error' && 'bg-rose-50 text-rose-700',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
      )}
    >
      {children}
    </div>
  );
}

