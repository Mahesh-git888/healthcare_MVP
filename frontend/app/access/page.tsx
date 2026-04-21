'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { exchangeAccessLink } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';

export default function AccessPage() {
  return (
    <Suspense fallback={<AccessPageFallback />}>
      <AccessPageContent />
    </Suspense>
  );
}

function AccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Access token is missing. Please ask admin to generate a new secure link.');
        return;
      }

      try {
        const response = await exchangeAccessLink(token);
        setPartnerSession(response.accessToken, response.partner);
        router.replace('/submit-lead');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to verify access link');
      }
    }

    void verifyToken();
  }, [router, token]);

  return (
    <PageShell
      title="Verifying secure access"
      description="We are checking your secure partner link with the backend before opening the referral form."
      footer={
        <Link href="/login" className="font-semibold text-brand-700">
          Use phone login instead
        </Link>
      }
    >
      <Card className="space-y-4 text-center">
        {error ? (
          <>
            <Notice tone="error">{error}</Notice>
            <Link
              href="/login"
              className="inline-flex justify-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Go to Partner Login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
            <p className="text-sm text-slate-600">Checking token and preparing your lead submission session.</p>
          </>
        )}
      </Card>
    </PageShell>
  );
}

function AccessPageFallback() {
  return (
    <PageShell
      title="Verifying secure access"
      description="We are checking your secure partner link with the backend before opening the referral form."
    >
      <Card className="space-y-4 text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
        <p className="text-sm text-slate-600">
          Checking token and preparing your lead submission session.
        </p>
      </Card>
    </PageShell>
  );
}
