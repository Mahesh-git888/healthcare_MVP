'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { registerPartner } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';
import { PartnerRole } from '@/lib/types';

const roles: PartnerRole[] = ['Nurse', 'Paramedic', 'Physiotherapist'];

const initialState = {
  name: '',
  phone: '',
  role: 'Nurse' as PartnerRole,
  city: '',
  area: '',
  organizationName: '',
  address: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await registerPartner(form);
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
      description="Register your organization details once, then submit patient leads from the same secure flow."
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-brand-700">
            Log in with phone
          </Link>
        </>
      }
    >
      <Card>
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
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="Enter registered phone number"
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
            placeholder="City"
            required
          />
          <Input
            label="Area"
            value={form.area}
            onChange={(event) => setForm({ ...form, area: event.target.value })}
            placeholder="Area / locality"
            required
          />
          <Input
            label="Organization name"
            value={form.organizationName}
            onChange={(event) =>
              setForm({ ...form, organizationName: event.target.value })
            }
            placeholder="Clinic / agency / hospital name"
            required
          />
          <Textarea
            label="Address"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="Full address"
            required
          />

          {error ? <Notice tone="error">{error}</Notice> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create partner account'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}

