'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { EarningsWidget } from '@/components/earnings-widget';
import { clearPartnerSession, getPartnerSession } from '@/lib/auth';
import { submitLead } from '@/lib/api';

const initialLead = {
  patientName: '',
  phone: '',
  city: '',
  area: '',
  serviceType: '',
  shiftType: '',
};

export default function SubmitLeadPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [lead, setLead] = useState(initialLead);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerToken, setPartnerToken] = useState('');

  useEffect(() => {
    const session = getPartnerSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setPartnerName(session.partner.name);
    setPartnerToken(session.token);
    setReady(true);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getPartnerSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await submitLead(session.token, {
        ...lead,
        shiftType: lead.shiftType || undefined,
      });
      setMessage(`${response.message}. Status: ${response.status}`);
      setLead(initialLead);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit lead');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearPartnerSession();
    router.replace('/login');
  }

  if (!ready) {
    return (
      <PageShell
        title="Opening your lead form"
        description="Please wait while we restore your partner session."
      >
        <Card className="text-center">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Submit a patient lead"
      description="Captured leads are validated by the backend and appended to the referral sheet instantly."
    >
      <div className="space-y-4">
        {partnerToken ? <EarningsWidget token={partnerToken} /> : null}
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Logged in partner
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">
                {partnerName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Logout
            </button>
          </div>
        </Card>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Patient name"
              value={lead.patientName}
              onChange={(event) =>
                setLead({ ...lead, patientName: event.target.value })
              }
              placeholder="Patient full name"
              required
            />
            <Input
              label="Patient phone"
              value={lead.phone}
              onChange={(event) => setLead({ ...lead, phone: event.target.value })}
              placeholder="Patient phone number"
              required
            />
            <Input
              label="City"
              value={lead.city}
              onChange={(event) => setLead({ ...lead, city: event.target.value })}
              placeholder="City"
              required
            />
            <Input
              label="Area"
              value={lead.area}
              onChange={(event) => setLead({ ...lead, area: event.target.value })}
              placeholder="Area / locality"
              required
            />
            <Input
              label="Service type"
              value={lead.serviceType}
              onChange={(event) =>
                setLead({ ...lead, serviceType: event.target.value })
              }
              placeholder="ICU care / physiotherapy / nursing care"
              required
            />
            <Input
              label="Shift type (optional)"
              value={lead.shiftType}
              onChange={(event) =>
                setLead({ ...lead, shiftType: event.target.value })
              }
              placeholder="Day shift / night shift / 24 hours"
            />

            {message ? <Notice tone="success">{message}</Notice> : null}
            {error ? <Notice tone="error">{error}</Notice> : null}

            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit lead'}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
