'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { loginAdmin } from '@/lib/api';
import { setAdminSession } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginAdmin(email, password);
      setAdminSession(response.accessToken, response.admin);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Admin login"
      description="Use your seeded admin credentials to manage partner onboarding and secure access links."
    >
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            required
          />
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Open dashboard'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}

