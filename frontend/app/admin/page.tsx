'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import {
  createPartnerByAdmin,
  generateBdoLink,
  generatePartnerLink,
  getBdos,
  getPartners,
} from '@/lib/api';
import { clearAdminSession, getAdminSession } from '@/lib/auth';
import { ALL_CITIES, STATE_CITY_OPTIONS, getCitiesForState } from '@/lib/location-options';
import { Bdo, Partner, PartnerRole } from '@/lib/types';

const roles: PartnerRole[] = ['Nurse', 'Paramedic', 'Physiotherapist'];

const initialForm = {
  name: '',
  phone: '',
  role: 'Nurse' as PartnerRole,
  state: '',
  city: '',
  organizationName: '',
  bdoId: '',
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bdos, setBdos] = useState<Bdo[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const cities = useMemo(
    () => (form.state ? getCitiesForState(form.state) : ALL_CITIES),
    [form.state],
  );

  useEffect(() => {
    async function loadData() {
      const session = getAdminSession();

      if (!session) {
        router.replace('/admin/login');
        return;
      }

      try {
        const [partnerList, bdoList] = await Promise.all([
          getPartners(session.token),
          getBdos(session.token),
        ]);
        setPartners(partnerList);
        setBdos(bdoList);
        setReady(true);
      } catch {
        clearAdminSession();
        router.replace('/admin/login');
      }
    }

    void loadData();
  }, [router]);

  async function refreshData() {
    const session = getAdminSession();
    if (!session) {
      return;
    }

    const [partnerList, bdoList] = await Promise.all([
      getPartners(session.token),
      getBdos(session.token),
    ]);
    setPartners(partnerList);
    setBdos(bdoList);
  }

  async function handleCreatePartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getAdminSession();

    if (!session) {
      router.replace('/admin/login');
      return;
    }

    setError('');
    setSuccess('');

    if (form.phone.length !== 10) {
      setError('Please enter a valid 10-digit partner phone number.');
      return;
    }

    if (!form.city) {
      setError('Please choose a city.');
      return;
    }

    setLoading(true);

    try {
      await createPartnerByAdmin(session.token, {
        name: form.name.trim(),
        phone: form.phone,
        role: form.role,
        city: form.city,
        organizationName: form.organizationName.trim() || undefined,
        bdoId: form.bdoId || undefined,
      });
      setForm(initialForm);
      setSuccess('Partner created successfully.');
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create partner');
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePartnerLink(partnerId: string) {
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
      setSuccess('Partner access link generated.');
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(response.accessLink).catch(() => undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate partner link');
    }
  }

  async function handleGenerateBdoLink(bdoId: string) {
    const session = getAdminSession();

    if (!session) {
      router.replace('/admin/login');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await generateBdoLink(session.token, bdoId);
      setGeneratedLink(response.whatsappLink);
      setSuccess(`BDO deep link generated for ${response.bdo.employeeId}.`);
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(response.whatsappLink).catch(() => undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate BDO link');
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
        description="We are verifying your admin session before loading partner and BDO data."
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
      description="Manage partner onboarding, review registered partners, and generate BDO WhatsApp deep links."
    >
      <div className="space-y-4">
        <Card className="flex items-center justify-between gap-4 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              Admin controls
            </p>
            <p className="mt-1 text-sm text-slate-600">
              BDO deep links, partner registration, and secure access link management
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

        {generatedLink ? (
          <Card className="space-y-3 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
            <h3 className="font-semibold text-ink">Latest generated link</h3>
            <Notice tone="success">
              Copied to clipboard when supported by your browser.
            </Notice>
            <p className="break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {generatedLink}
            </p>
          </Card>
        ) : null}

        <Card className="space-y-4 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              BDO referral links
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Each BDO gets a WhatsApp deep link like
              {' '}
              <span className="font-medium">https://wa.me/919345884291?text=&lt;BDO_ID&gt;</span>
              .
            </p>
          </div>

          <div className="space-y-3">
            {bdos.map((bdo) => (
              <div
                key={bdo.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{bdo.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {bdo.employeeId} • {bdo.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {bdo.email} • {bdo.city}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGenerateBdoLink(bdo.employeeId)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm"
                  >
                    Generate deep link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
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
              onChange={(event) =>
                setForm({ ...form, phone: normalizePhone(event.target.value) })
              }
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
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

            <Select
              label="State (optional helper)"
              value={form.state}
              onChange={(event) => setForm({ ...form, state: event.target.value, city: '' })}
            >
              <option value="">Show all cities</option>
              {STATE_CITY_OPTIONS.map((entry) => (
                <option key={entry.state} value={entry.state}>
                  {entry.state}
                </option>
              ))}
            </Select>

            <Select
              label="City"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              required
            >
              <option value="">Select city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>

            <Input
              label="Organization name (optional)"
              value={form.organizationName}
              onChange={(event) =>
                setForm({ ...form, organizationName: event.target.value })
              }
            />

            <Select
              label="BDO (optional)"
              value={form.bdoId}
              onChange={(event) => setForm({ ...form, bdoId: event.target.value })}
            >
              <option value="">No BDO mapping</option>
              {bdos.map((bdo) => (
                <option key={bdo.id} value={bdo.employeeId}>
                  {bdo.employeeId} - {bdo.name}
                </option>
              ))}
            </Select>

            {success ? <Notice tone="success">{success}</Notice> : null}
            {error ? <Notice tone="error">{error}</Notice> : null}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating partner...' : 'Create partner'}
            </Button>
          </form>
        </Card>

        <Card className="space-y-4 rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Partner directory
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate secure one-click access links for any registered partner.
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
                      {partner.city}
                      {partner.organizationName ? ` • ${partner.organizationName}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGeneratePartnerLink(partner.id)}
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
