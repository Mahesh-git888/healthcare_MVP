'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { getPartnerEarnings } from '@/lib/api';
import { PartnerEarningsResponse } from '@/lib/types';

export function EarningsWidget({ token }: { token: string }) {
  const [data, setData] = useState<PartnerEarningsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await getPartnerEarnings(token);
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load earnings');
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <Card className="space-y-2 border border-rose-100 bg-rose-50/60">
        <p className="text-sm font-semibold text-rose-700">Wallet</p>
        <Notice tone="error">{error}</Notice>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Wallet
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-ink">
            Your earnings
          </p>
        </div>
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
      </Card>
    );
  }

  if (data.coming_soon) {
    return (
      <Card className="relative overflow-hidden border border-slate-200 bg-slate-50/70">
        <div className="absolute right-4 top-4 rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
          Coming soon
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <WalletIcon className="h-6 w-6 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold text-slate-700">
              Your wallet
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {data.message}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
            <WalletIcon className="h-6 w-6 text-brand-700" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              Wallet
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">
              Your earnings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-3xl bg-slate-50 p-4">
        <Summary label="Total" value={data.summary.total_earned} />
        <Summary label="Pending" value={data.summary.pending} />
        <Summary label="Paid" value={data.summary.paid} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100">
        <div className="grid grid-cols-4 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <div className="col-span-2">Patient</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-slate-100">
          {data.leads.map((row, index) => (
            <div
              key={`${row.patient_name}-${index}`}
              className="grid grid-cols-4 gap-2 px-4 py-3 text-sm text-slate-700"
            >
              <div className="col-span-2">
                <p className="font-semibold text-ink">{row.patient_name}</p>
                <p className="mt-1 text-xs text-slate-500">{row.service}</p>
              </div>
              <div className="font-semibold">{row.amount}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {row.status}
              </div>
            </div>
          ))}
          {!data.leads.length ? (
            <div className="px-4 py-4 text-sm text-slate-600">
              No earnings recorded yet.
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-ink">
        {value ?? '-'}
      </p>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 7.5c0-1.38 1.12-2.5 2.5-2.5h9.25C19.55 5 21 6.45 21 8.25V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 7.5h10.8c1.2 0 2.2.98 2.2 2.2v7.05c0 1.38-1.12 2.5-2.5 2.5H8.5A2.5 2.5 0 0 1 6 16.75V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M21 11.25h-3.25c-1.1 0-2 .9-2 2s.9 2 2 2H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M17.8 13.25h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
