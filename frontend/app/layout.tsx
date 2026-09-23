import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import LoginModal from '@/components/auth/LoginModal';

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
        <AuthProvider>
          {children}
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}
