import { ReactNode } from 'react';
import Link from 'next/link';

export function PageShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex justify-center">
          <img
            src="/portea-logo.svg"
            alt="Portea"
            className="h-16 w-auto object-contain sm:h-20"
          />
        </Link>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 text-center text-sm text-slate-600">{footer}</div> : null}
    </main>
  );
}
