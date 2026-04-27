'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { EarningsWidget } from '@/components/earnings-widget';
import { clearPartnerSession, getPartnerSession } from '@/lib/auth';
import { submitLead } from '@/lib/api';

const serviceOptions = [
  '',
  'Nurse attendant',
  'Physio therapist',
  'Nurse resident',
  'Visiting nurse',
  'Equipment sale',
  'Equipment rental',
];

const initialLead = {
  patientName: '',
  phone: '',
  serviceType: '',
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

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

    if (lead.phone.length !== 10) {
      setError('Please enter a valid 10-digit patient phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await submitLead(session.token, {
        patientName: lead.patientName.trim(),
        phone: lead.phone,
        serviceType: lead.serviceType || undefined,
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
      description="Only the key patient details are needed. Your registered city will be used automatically."
    >
      <div className="space-y-4">
        {partnerToken ? <EarningsWidget token={partnerToken} /> : null}

        <Card className="space-y-3 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
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

        <Card className="rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
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
              onChange={(event) =>
                setLead({ ...lead, phone: normalizePhone(event.target.value) })
              }
              placeholder="10-digit patient phone number"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
            />

            <Select
              label="Service type (optional)"
              value={lead.serviceType}
              onChange={(event) =>
                setLead({ ...lead, serviceType: event.target.value })
              }
            >
              <option value="">Select later / skip for now</option>
              {serviceOptions
                .filter(Boolean)
                .map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
            </Select>

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
