import { ReactNode } from 'react';
import Link from 'next/link';

export function PageShell({
  title,
  description,
  children,
  footer,
  headerAction,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="inline-flex">
            <img
              src="/portea-logo.svg"
              alt="Portea"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>
          {headerAction ? <div className="pt-2">{headerAction}</div> : null}
        </div>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[560px] text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      {children}
      {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
    </main>
  );
}
