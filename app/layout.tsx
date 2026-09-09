import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'NEXO — свой AI-участник в Discord',
  description:
    'Понимает контекст, подхватывает шутки и учится новому. AI-бот для Discord с собственным характером.',
  metadataBase: new URL('https://nexo-discord-ai.egor-popoff2015.chatgpt.site'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body>{children}</body>
    </html>
  );
}
