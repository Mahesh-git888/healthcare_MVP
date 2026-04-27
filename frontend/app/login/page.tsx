'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SiteLanguageSelect } from '@/components/site-language-select';
import { loginPartner } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';
import { SiteLanguage, useSiteLanguage } from '@/lib/site-language';

const copy: Record<
  SiteLanguage,
  {
    title: string;
    description: string;
    admin: string;
    footerLabel: string;
    footerLink: string;
    phone: string;
    error: string;
    checking: string;
    continue: string;
  }
> = {
  en: {
    title: 'Health Angel login',
    description: 'Use your registered phone number to continue.',
    admin: 'Admin',
    footerLabel: 'New here?',
    footerLink: 'Join as Health Angel',
    phone: 'Phone number',
    error: 'Please enter a valid 10-digit phone number.',
    checking: 'Checking...',
    continue: 'Continue',
  },
  hi: {
    title: 'हेल्थ एंजल लॉगिन',
    description: 'आगे बढ़ने के लिए अपना रजिस्टर्ड फोन नंबर दर्ज करें।',
    admin: 'एडमिन',
    footerLabel: 'नए हैं?',
    footerLink: 'हेल्थ एंजल बनें',
    phone: 'फोन नंबर',
    error: 'कृपया सही 10 अंकों का फोन नंबर दर्ज करें।',
    checking: 'जांच हो रही है...',
    continue: 'आगे बढ़ें',
  },
  kn: {
    title: 'ಹೆಲ್ತ್ ಏಂಜಲ್ ಲಾಗಿನ್',
    description: 'ಮುಂದುವರಿಸಲು ನಿಮ್ಮ ನೋಂದಾಯಿತ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ.',
    admin: 'ಅಡ್ಮಿನ್',
    footerLabel: 'ಹೊಸವರಾ?',
    footerLink: 'ಹೆಲ್ತ್ ಏಂಜಲ್ ಆಗಿ ಸೇರಿ',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    error: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    checking: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    continue: 'ಮುಂದುವರಿಸಿ',
  },
  ta: {
    title: 'ஹெல்த் ஏஞ்சல் உள்நுழைவு',
    description: 'தொடர உங்கள் பதிவு செய்யப்பட்ட தொலைபேசி எண்ணை பயன்படுத்தவும்.',
    admin: 'அட்மின்',
    footerLabel: 'புதியவரா?',
    footerLink: 'ஹெல்த் ஏஞ்சலாக சேருங்கள்',
    phone: 'தொலைபேசி எண்',
    error: 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.',
    checking: 'சரிபார்க்கப்படுகிறது...',
    continue: 'தொடரவும்',
  },
  te: {
    title: 'హెల్త్ ఏంజెల్ లాగిన్',
    description: 'కొనసాగడానికి మీ రిజిస్టర్డ్ ఫోన్ నంబర్ ఉపయోగించండి.',
    admin: 'అడ్మిన్',
    footerLabel: 'కొత్తవారా?',
    footerLink: 'హెల్త్ ఏంజెల్‌గా చేరండి',
    phone: 'ఫోన్ నంబర్',
    error: 'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ ఇవ్వండి.',
    checking: 'తనిఖీ చేస్తోంది...',
    continue: 'కొనసాగండి',
  },
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError(text.error);
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
      title={text.title}
      description={text.description}
      headerAction={
        <div className="flex items-center gap-2">
          <SiteLanguageSelect value={language} onChange={setLanguage} />
          <Link
            href="/admin/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {text.admin}
          </Link>
        </div>
      }
      footer={
        <>
          {text.footerLabel}{' '}
          <Link href="/register" className="font-semibold text-brand-700">
            {text.footerLink}
          </Link>
        </>
      }
    >
      <Card className="rounded-[28px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label={text.phone}
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
            {loading ? text.checking : text.continue}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
