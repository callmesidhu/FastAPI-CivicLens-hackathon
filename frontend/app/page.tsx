'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/ui/HeroSection';
import HowItWorks from '@/components/ui/HowItWorks';
import MapPreviewCta from '@/components/ui/MapPreviewCta';
import WhyCivicLens from '@/components/ui/WhyCivicLens';
import Footer from '@/components/ui/Footer';
import TrackTicket from '@/components/reports/TrackTicket';
import SyncManager from '@/components/sync/SyncManager';

export default function Home() {
  const router = useRouter();
  const [showTrackTicket, setShowTrackTicket] = useState(false);

  const handleNavigateToMap = () => {
    router.push('/map');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EDF7]">
      {/* Top Sticky Navbar */}
      <Navbar
        onOpenTrackTicket={() => setShowTrackTicket(true)}
        onOpenReport={handleNavigateToMap}
      />

      {/* Hero Section */}
      <HeroSection
        onReportClick={handleNavigateToMap}
        onViewMapClick={handleNavigateToMap}
      />

      {/* How It Works (Simple 4-Step Process) */}
      <HowItWorks />

      {/* Map Preview & Interactive Portal Launch CTA */}
      <MapPreviewCta />

      {/* Why CivicLens (Municipal Innovation 6-Feature Grid) */}
      <WhyCivicLens />

      {/* Footer */}
      <Footer />

      {/* Offline Sync Manager Widget */}
      <SyncManager />

      {/* Track Ticket Modal */}
      {showTrackTicket && (
        <TrackTicket onClose={() => setShowTrackTicket(false)} />
      )}
    </div>
  );
}
