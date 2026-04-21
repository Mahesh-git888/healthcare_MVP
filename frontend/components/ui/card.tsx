import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-soft backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

