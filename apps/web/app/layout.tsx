import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EgresadosNet — Conectando Talento y Oportunidades',
  description: 'Sistema web de gestión de egresados y oferta laboral universitaria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakarta.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg-base)] font-[family-name:var(--font-body)] text-[var(--color-text-primary)] transition-colors duration-300">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
