import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicLens - See. Verify. Access.',
  description: 'Find nearby public toilets and drinking-water points. Neighborhood Intelligence & Response Assistant.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
