import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/ui/LayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Lamb House Goat Farm',
  description: 'Farm Management System for The Lamb House Goat Farm, Mananthavady',
  icons: { icon: '/logo.jpg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
