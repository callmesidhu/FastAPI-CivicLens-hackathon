import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import LoginModal from '@/components/auth/LoginModal';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import OfflineStatusBar from '@/components/pwa/OfflineStatusBar';

export const metadata: Metadata = {
  title: 'CivicLens — See. Verify. Access.',
  description: 'Find nearby public toilets and drinking-water points. Neighbourhood Intelligence & Response Assistant.',
  manifest: '/manifest.json',
  applicationName: 'CivicLens',
  keywords: ['civic', 'facilities', 'public toilets', 'water points', 'kochi', 'map', 'pwa'],
  authors: [{ name: 'CivicLens Team' }],
  appleWebApp: {
    capable: true,
    title: 'CivicLens',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'CivicLens — See. Verify. Access.',
    description: 'Find nearby civic facilities. Real-time map of public toilets and water points.',
    siteName: 'CivicLens',
  },
  twitter: {
    card: 'summary',
    title: 'CivicLens',
    description: 'Find nearby civic facilities. Real-time map.',
  },
  icons: {
    icon: [
      { url: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#3D1860',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA — apple-mobile-web-app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/pwa-icon-192.png" />
        <link rel="apple-touch-startup-image" href="/pwa-icon-512.png" />
        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#3D1860" />
        <meta name="msapplication-TileImage" content="/pwa-icon-192.png" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <OfflineStatusBar />
          {children}
          <LoginModal />
          <PWAInstallPrompt />
        </AuthProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[PWA] Service Worker registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[PWA] Service Worker registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
