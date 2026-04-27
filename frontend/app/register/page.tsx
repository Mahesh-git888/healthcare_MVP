'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { registerPartner } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';
import { ALL_CITIES, STATE_CITY_OPTIONS, getCitiesForState } from '@/lib/location-options';
import { PartnerRole } from '@/lib/types';

const roles: PartnerRole[] = ['Nurse', 'Paramedic', 'Physiotherapist'];

const initialState = {
  name: '',
  phone: '',
  role: 'Nurse' as PartnerRole,
  state: '',
  city: '',
  organizationName: '',
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bdoId = searchParams.get('bdo_id')?.trim() || '';
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = useMemo(
    () => (form.state ? getCitiesForState(form.state) : ALL_CITIES),
    [form.state],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!form.city) {
      setError('Please choose a city.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerPartner({
        name: form.name.trim(),
        phone: form.phone,
        role: form.role,
        city: form.city,
        organizationName: form.organizationName.trim() || undefined,
        ...(bdoId ? { bdoId } : {}),
      });
      setPartnerSession(response.accessToken, response.partner);
      router.push('/submit-lead');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register partner');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Partner registration"
      description="Register with the minimum details needed so you can begin sharing patient leads quickly."
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-brand-700">
            Log in with phone
          </Link>
        </>
      }
    >
      <Card className="rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Phone number"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: normalizePhone(event.target.value) })
            }
            placeholder="10-digit phone number"
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
            placeholder="Clinic / agency / hospital name"
          />

          {bdoId ? <Notice tone="success">Referral ID linked: {bdoId}</Notice> : null}
          {error ? <Notice tone="error">{error}</Notice> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create partner account'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}

function RegisterFallback() {
  return (
    <PageShell
      title="Partner registration"
      description="Register with the minimum details needed so you can begin sharing patient leads quickly."
    >
      <Card className="text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
      </Card>
    </PageShell>
  );
}
