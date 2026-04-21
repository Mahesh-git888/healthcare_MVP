import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageShell } from '@/components/layout/page-shell';

const actions = [
  {
    href: '/register',
    label: 'Register as Partner',
    description: 'New nurses, paramedics, and physiotherapists can onboard here.',
  },
  {
    href: '/login',
    label: 'Partner Phone Login',
    description: 'Returning partners can log in using their registered phone number.',
  },
  {
    href: '/admin/login',
    label: 'Admin Access',
    description: 'Operations teams can create partners and generate secure access links.',
  },
];

export default function HomePage() {
  return (
    <PageShell
      title="Trusted referrals, captured in minutes."
      description="A mobile-first intake flow for partner onboarding, secure access links, and patient lead submission."
    >
      <Card className="space-y-4">
        <div className="rounded-3xl bg-health-glow p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
            Built for field teams
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
            Faster healthcare lead capture for partner networks.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Secure access for registered partners, simple phone login, and direct lead logging to Google Sheets.
          </p>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="block rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
            >
              <p className="font-semibold text-ink">{action.label}</p>
              <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

