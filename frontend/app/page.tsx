import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageShell } from '@/components/layout/page-shell';

export default function HomePage() {
  return (
    <PageShell
      title="Partner referrals with less friction."
      description="Register quickly, share patient leads in seconds, and check wallet progress without waiting on month-end updates."
    >
      <div className="space-y-4">
        <Card className="space-y-4 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <div className="rounded-[24px] bg-health-glow p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              Built for partner networks
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
              Simple onboarding. Simple lead sharing. Clearer wallet visibility.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The goal is to make it easy for partners to register, send leads fast, and stay aligned with BDO referrals.
            </p>
          </div>

          <div className="grid gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-brand-700 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Register as Partner
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-brand-200 bg-white px-5 py-4 text-sm font-semibold text-brand-800 transition hover:border-brand-300"
            >
              Partner Login
            </Link>
          </div>
        </Card>

        <Card className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin access
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            For operations teams managing BDO links, partner records, and secure access flows.
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Open Admin Login
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
