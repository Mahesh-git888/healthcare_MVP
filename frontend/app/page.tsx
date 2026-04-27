import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageShell } from '@/components/layout/page-shell';

export default function HomePage() {
  return (
    <PageShell
      title="Partner referrals made simpler."
      description="This portal is for partners to register quickly, submit patient leads with minimal effort, and track wallet visibility without month-end follow-up."
      headerAction={
        <Link
          href="/admin/login"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-800"
        >
          Admin login
        </Link>
      }
    >
      <div className="space-y-5">
        <Card className="rounded-[32px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                Partner portal
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                Register once. Share leads fast. Check wallet progress anytime.
              </h2>
              <p className="max-w-[520px] text-sm leading-7 text-slate-600 sm:text-base">
                The flow is designed to reduce friction for partners, keep BDO referrals mapped correctly, and make every new lead quick to submit.
              </p>
            </div>
            <div className="rounded-[28px] bg-health-glow p-5">
              <p className="text-sm font-semibold text-brand-800">What partners can do here</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Register with just the essentials.</li>
                <li>Submit a patient lead in seconds.</li>
                <li>See wallet updates without waiting for manual follow-up.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)] sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/register"
              className="rounded-[24px] bg-brand-700 px-5 py-5 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Register as partner
            </Link>
            <Link
              href="/login"
              className="rounded-[24px] border border-brand-200 bg-white px-5 py-5 text-sm font-semibold text-brand-800 transition hover:border-brand-300"
            >
              Partner login
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
