'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import {
  createPartnerByAdmin,
  generatePartnerLink,
  getPartners,
} from '@/lib/api';
import { clearAdminSession, getAdminSession } from '@/lib/auth';
import { Partner, PartnerRole } from '@/lib/types';

const roles: PartnerRole[] = ['Nurse', 'Paramedic', 'Physiotherapist'];

const initialForm = {
  name: '',
  phone: '',
  role: 'Nurse' as PartnerRole,
  city: '',
  area: '',
  organizationName: '',
  address: '',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadPartners() {
      const session = getAdminSession();

      if (!session) {
        router.replace('/admin/login');
        return;
      }

      try {
        const partnerList = await getPartners(session.token);
        setPartners(partnerList);
        setReady(true);
      } catch {
        clearAdminSession();
        router.replace('/admin/login');
      }
    }

    void loadPartners();
  }, [router]);

  async function refreshPartners() {
    const session = getAdminSession();

    if (!session) {
      return;
    }

    const partnerList = await getPartners(session.token);
    setPartners(partnerList);
  }

  async function handleCreatePartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getAdminSession();

    if (!session) {
      router.replace('/admin/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createPartnerByAdmin(session.token, form);
      setForm(initialForm);
      setSuccess('Partner created successfully.');
      await refreshPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create partner');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLink(partnerId: string) {
    const session = getAdminSession();

    if (!session) {
      router.replace('/admin/login');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await generatePartnerLink(session.token, partnerId);
      setGeneratedLink(response.accessLink);
      setSuccess('Secure access link generated.');
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(response.accessLink).catch(() => {
          return undefined;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate access link');
    }
  }

  function handleLogout() {
    clearAdminSession();
    router.replace('/admin/login');
  }

  if (!ready) {
    return (
      <PageShell
        title="Preparing dashboard"
        description="We are verifying your admin session before loading partner records."
      >
        <Card className="text-center">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Admin dashboard"
      description="Create partners, review partner accounts, and generate secure access links for one-click onboarding."
    >
      <div className="space-y-4">
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              Admin controls
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Partner creation and secure-link management
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Logout
          </button>
        </Card>

        <Card>
          <form className="space-y-4" onSubmit={handleCreatePartner}>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Create partner
            </h2>
            <Input
              label="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <Input
              label="Phone number"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              required
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as PartnerRole })
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <Input
              label="City"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              required
            />
            <Input
              label="Area"
              value={form.area}
              onChange={(event) => setForm({ ...form, area: event.target.value })}
              required
            />
            <Input
              label="Organization name"
              value={form.organizationName}
              onChange={(event) =>
                setForm({ ...form, organizationName: event.target.value })
              }
              required
            />
            <Textarea
              label="Address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              required
            />

            {success ? <Notice tone="success">{success}</Notice> : null}
            {error ? <Notice tone="error">{error}</Notice> : null}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating partner...' : 'Create partner'}
            </Button>
          </form>
        </Card>

        {generatedLink ? (
          <Card className="space-y-3">
            <h3 className="font-semibold text-ink">Latest secure access link</h3>
            <Notice tone="success">
              Copied to clipboard when supported by your browser.
            </Notice>
            <p className="break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {generatedLink}
            </p>
          </Card>
        ) : null}

        <Card className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Partner directory
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate secure links for any registered partner.
            </p>
          </div>

          <div className="space-y-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{partner.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {partner.role} • {partner.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {partner.city}, {partner.area}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {partner.organizationName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGenerateLink(partner.id)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm"
                  >
                    Generate link
                  </button>
                </div>
              </div>
            ))}

            {!partners.length ? (
              <Notice>No partners created yet. Use the form above to add the first partner.</Notice>
            ) : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
