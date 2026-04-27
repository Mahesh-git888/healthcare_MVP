'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { loginPartner } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginPartner(phone);
      setPartnerSession(response.accessToken, response.partner);
      router.push('/submit-lead');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Partner login"
      description="Use your registered 10-digit phone number to continue."
      headerAction={
        <Link
          href="/admin/login"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Admin
        </Link>
      }
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-brand-700">
            Register as a partner
          </Link>
        </>
      }
    >
      <Card className="rounded-[28px] border-0 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Phone number"
            value={phone}
            onChange={(event) => setPhone(normalizePhone(event.target.value))}
            placeholder="10-digit phone number"
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            required
          />

          {error ? <Notice tone="error">{error}</Notice> : null}

          <Button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
