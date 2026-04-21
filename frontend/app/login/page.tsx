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

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
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
      title="Partner phone login"
      description="Enter the phone number used during onboarding to access the lead submission form."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-brand-700">
            Register as a partner
          </Link>
        </>
      }
    >
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter your phone number"
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

