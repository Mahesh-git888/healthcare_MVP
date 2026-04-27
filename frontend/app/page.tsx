'use client';

import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { SiteLanguageSelect } from '@/components/site-language-select';
import { SiteLanguage, useSiteLanguage } from '@/lib/site-language';

const copy: Record<
  SiteLanguage,
  {
    title: string;
    description: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    walletNote: string;
    register: string;
    login: string;
    admin: string;
  }
> = {
  en: {
    title: 'Health Angels',
    description: 'Refer a patient, help a family, and earn directly in your wallet.',
    eyebrow: 'Portea referral partner app',
    heroTitle: 'Share care referrals. Earn simply.',
    heroBody:
      'Join as a Health Angel, send patient details in a few steps, and keep track of what you earn.',
    walletNote: 'Every successful referral adds to your wallet.',
    register: 'Join as Health Angel',
    login: 'Health Angel login',
    admin: 'Admin login',
  },
  hi: {
    title: 'हेल्थ एंजल्स',
    description: 'रोगी रेफर करें, परिवार की मदद करें और अपनी वॉलेट कमाई देखें।',
    eyebrow: 'पोर्टिया रेफरल पार्टनर ऐप',
    heroTitle: 'केयर रेफरल साझा करें। आसानी से कमाएँ।',
    heroBody:
      'हेल्थ एंजल बनें, कुछ आसान स्टेप्स में रोगी की जानकारी भेजें और अपनी कमाई ट्रैक करें।',
    walletNote: 'हर सफल रेफरल आपकी वॉलेट में जुड़ता है।',
    register: 'हेल्थ एंजल बनें',
    login: 'हेल्थ एंजल लॉगिन',
    admin: 'एडमिन लॉगिन',
  },
  kn: {
    title: 'ಹೆಲ್ತ್ ಏಂಜಲ್ಸ್',
    description: 'ರೋಗಿಯನ್ನು ಪರಿಚಯಿಸಿ, ಕುಟುಂಬಕ್ಕೆ ಸಹಾಯ ಮಾಡಿ, ನಿಮ್ಮ ವಾಲೆಟ್ ಆದಾಯ ನೋಡಿ.',
    eyebrow: 'ಪೋರ್ಟಿಯಾ ರೆಫರಲ್ ಪಾರ್ಟ್ನರ್ ಆಪ್',
    heroTitle: 'ಕೇರ್ ರೆಫರಲ್ ಹಂಚಿ. ಸರಳವಾಗಿ ಸಂಪಾದಿಸಿ.',
    heroBody:
      'ಹೆಲ್ತ್ ಏಂಜಲ್ ಆಗಿ ಸೇರಿ, ಕೆಲವೇ ಹಂತಗಳಲ್ಲಿ ರೋಗಿಯ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಆದಾಯವನ್ನು ಗಮನಿಸಿ.',
    walletNote: 'ಪ್ರತಿ ಯಶಸ್ವಿ ರೆಫರಲ್ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಸೇರುತ್ತದೆ.',
    register: 'ಹೆಲ್ತ್ ಏಂಜಲ್ ಆಗಿ ಸೇರಿ',
    login: 'ಹೆಲ್ತ್ ಏಂಜಲ್ ಲಾಗಿನ್',
    admin: 'ಅಡ್ಮಿನ್ ಲಾಗಿನ್',
  },
  ta: {
    title: 'ஹெல்த் ஏஞ்சல்ஸ்',
    description: 'நோயாளியை பரிந்துரையிடுங்கள், குடும்பத்திற்கு உதவுங்கள், உங்கள் வாலெட் வருமானத்தை பாருங்கள்.',
    eyebrow: 'போர்டியா ரெஃபரல் பார்ட்னர் ஆப்',
    heroTitle: 'கேர் ரெஃபரல் பகிருங்கள். எளிதாக சம்பாதியுங்கள்.',
    heroBody:
      'ஹெல்த் ஏஞ்சலாக சேர்ந்து, சில படிகளில் நோயாளர் விவரங்களை பகிர்ந்து, உங்கள் வருமானத்தை கண்காணிக்கவும்.',
    walletNote: 'ஒவ்வொரு வெற்றிகரமான ரெஃபரலும் உங்கள் வாலெட்டில் சேரும்.',
    register: 'ஹெல்த் ஏஞ்சலாக சேருங்கள்',
    login: 'ஹெல்த் ஏஞ்சல் உள்நுழைவு',
    admin: 'அட்மின் உள்நுழைவு',
  },
  te: {
    title: 'హెల్త్ ఏంజెల్స్',
    description: 'రోగిని రిఫర్ చేయండి, కుటుంబానికి సహాయం చేయండి, మీ వాలెట్ ఆదాయం చూడండి.',
    eyebrow: 'పోర్టియా రిఫరల్ పార్ట్నర్ యాప్',
    heroTitle: 'కేర్ రిఫరల్స్ పంచండి. సులభంగా సంపాదించండి.',
    heroBody:
      'హెల్త్ ఏంజెల్‌గా చేరండి, కొన్ని దశల్లో రోగి వివరాలు పంపండి, మీ ఆదాయాన్ని ట్రాక్ చేయండి.',
    walletNote: 'ప్రతి విజయవంతమైన రిఫరల్ మీ వాలెట్‌లో చేరుతుంది.',
    register: 'హెల్త్ ఏంజెల్‌గా చేరండి',
    login: 'హెల్త్ ఏంజెల్ లాగిన్',
    admin: 'అడ్మిన్ లాగిన్',
  },
};

export default function HomePage() {
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];

  return (
    <PageShell
      title={text.title}
      description={text.description}
      headerAction={
        <div className="flex items-center gap-2">
          <SiteLanguageSelect value={language} onChange={setLanguage} />
          <Link
            href="/admin/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-800"
          >
            {text.admin}
          </Link>
        </div>
      }
    >
      <Card className="overflow-hidden rounded-[32px] border-0 bg-white/94 p-0 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                {text.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
                {text.heroTitle}
              </h2>
              <p className="mt-4 max-w-[460px] text-sm leading-7 text-slate-600 sm:text-base">
                {text.heroBody}
              </p>
            </div>

            <div className="mt-6 rounded-[24px] bg-health-glow px-5 py-4 text-sm font-semibold text-brand-900">
              {text.walletNote}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/register"
                className="rounded-[22px] bg-brand-700 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                {text.register}
              </Link>
              <Link
                href="/login"
                className="rounded-[22px] border border-brand-200 bg-white px-5 py-4 text-center text-sm font-semibold text-brand-800 transition hover:border-brand-300"
              >
                {text.login}
              </Link>
            </div>
          </div>

          <div className="min-h-[280px] bg-slate-100">
            <img
              src="/hero-caregiver.webp"
              alt="Portea caregiver supporting a patient at home"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
