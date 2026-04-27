import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portea Partner Referrals',
  description: 'Low-friction partner onboarding, referral capture, and wallet visibility.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
