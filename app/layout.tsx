import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BauSuite AI',
  description: 'Modulare KI-SaaS für Bauunternehmen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
