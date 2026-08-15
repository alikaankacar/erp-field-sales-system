import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ERP Field Sales System',
    template: '%s | ERP Field Sales',
  },
  description: 'Vertical ERP & B2B Field Sales Automation System',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: [
    'ERP',
    'Field Sales',
    'B2B',
    'Sales Automation',
    'Inventory Management',
    'Production Tracking',
  ],
  authors: [{ name: 'Ali Kaan Kaçar' }],
  creator: 'Ali Kaan Kaçar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
