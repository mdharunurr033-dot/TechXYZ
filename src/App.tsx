import React, { useState, useEffect } from 'react';
import { Package, SiteSettings, FAQItem, Order } from './types';
import { fetchPackages, fetchSettings, fetchFaqs } from './lib/api';
import { INITIAL_PACKAGES, INITIAL_SETTINGS, INITIAL_FAQS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { ServicesSection } from './components/ServicesSection';
import { ReelsSection } from './components/ReelsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { OrderModal } from './components/OrderModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminDashboard } from './components/AdminDashboard';
import { analytics } from './lib/analytics';

export default function App() {
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  // Track order modal state
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderPrefill, setTrackOrderPrefill] = useState<{ orderId: string; phone?: string }>({
    orderId: '',
    phone: '',
  });

  // Confirmed / submitted order modal awaiting admin approval
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Admin Dashboard modal (Only accessible via secret URL: domain/techadmin/login)
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    analytics.pageView('Home');
    loadInitialData();

    // Check secret route: /techadmin/login, /techadmin, #techadmin/login, etc.
    const checkSecretAdminRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      if (
        path.startsWith('/techadmin') ||
        hash.startsWith('#techadmin') ||
        search.includes('techadmin')
      ) {
        setIsAdminOpen(true);
      }
    };

    // Check immediately on mount
    checkSecretAdminRoute();

    // Handle instant data refresh events
    const handleDataRefreshed = () => {
      loadInitialData();
    };

    window.addEventListener('tpbd:datarefreshed', handleDataRefreshed);
    window.addEventListener('hashchange', checkSecretAdminRoute);
    window.addEventListener('popstate', checkSecretAdminRoute);
    window.addEventListener('focus', handleDataRefreshed);
    window.addEventListener('storage', (e) => {
      if (e.key === 'tpbd_sync_time') {
        loadInitialData();
      }
    });

    // Cross-tab broadcast channel for instant live updates
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('tpbd_sync');
        broadcastChannel.onmessage = () => {
          loadInitialData();
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }

    // 4-second gentle background poll to ensure changes are live immediately across all devices
    const pollInterval = setInterval(() => {
      loadInitialData();
    }, 4000);

    return () => {
      window.removeEventListener('hashchange', checkSecretAdminRoute);
      window.removeEventListener('popstate', checkSecretAdminRoute);
      window.removeEventListener('tpbd:datarefreshed', handleDataRefreshed);
      window.removeEventListener('focus', handleDataRefreshed);
      clearInterval(pollInterval);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [pkgs, sttgs, fqs] = await Promise.all([
        fetchPackages(),
        fetchSettings(),
        fetchFaqs(),
      ]);
      if (pkgs && pkgs.length) setPackages(pkgs);
      if (sttgs) setSettings(sttgs);
      if (fqs && fqs.length) setFaqs(fqs);
    } catch (err) {
      console.warn('Live sync poll note:', err);
    }
  };

  const handleOpenOrder = (pkg?: Package, multiplier: number = 1) => {
    setSelectedPackage(pkg || packages[0]);
    setSelectedMultiplier(multiplier);
    setIsOrderModalOpen(true);
    if (pkg) {
      analytics.viewContent(pkg.name, pkg.category, pkg.basePrice);
    }
  };

  // When order is submitted from OrderModal, it is created with status PENDING awaiting Admin approval
  const handleProceedToPayment = (order: Order) => {
    setIsOrderModalOpen(false);
    setConfirmedOrder(order);
  };

  const handleTrackFromSuccess = (orderId: string, phone?: string) => {
    setConfirmedOrder(null);
    setTrackOrderPrefill({ orderId, phone: phone || '' });
    setIsTrackOrderOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
      {/* Header: No public admin login button */}
      <Navbar
        onOrderNowClick={() => handleOpenOrder()}
        onTrackOrderClick={() => {
          setTrackOrderPrefill({ orderId: '', phone: '' });
          setIsTrackOrderOpen(true);
        }}
        primaryWhatsapp={settings.primaryWhatsapp}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Styled Headline & 500MB Video Support */}
        <HeroSection
          onOrderNowClick={() => handleOpenOrder()}
          heroVideoUrl={settings.heroVideoUrl}
          heroVideoPoster={settings.heroVideoPoster}
        />

        {/* Horizontal Trust / Stats Section */}
        <StatsSection
          settings={settings}
          onOrderNowClick={() => handleOpenOrder()}
        />

        {/* Services & Dynamic Pricing Packages with Bold Category Tabs & Unlimited Volume */}
        <ServicesSection
          packages={packages}
          onSelectPackage={(pkg, mult) => handleOpenOrder(pkg, mult)}
        />

        {/* 3 Facebook Reels Size (9:16 Vertical) Video Section */}
        <ReelsSection
          reels={settings.reels}
          onOrderNowClick={() => handleOpenOrder()}
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Frequently Asked Questions */}
        <FAQSection
          faqs={faqs}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      </main>

      {/* Footer: Public admin login removed, updated Refund Policy */}
      <Footer settings={settings} />

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyCTA
        onOrderNowClick={() => handleOpenOrder()}
        primaryWhatsapp={settings.primaryWhatsapp}
      />

      {/* Order Modal: bKash / Nagad / Rocket with TrxID and Client Location */}
      {isOrderModalOpen && (
        <OrderModal
          packages={packages}
          initialPackage={selectedPackage}
          initialMultiplier={selectedMultiplier}
          onClose={() => setIsOrderModalOpen(false)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Order Submitted Screen: Pending Admin Approval */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={handleTrackFromSuccess}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      )}

      {/* Track Order Modal: Track with Order ID and Phone Number */}
      {isTrackOrderOpen && (
        <TrackOrderModal
          onClose={() => setIsTrackOrderOpen(false)}
          initialOrderId={trackOrderPrefill.orderId}
          initialPhone={trackOrderPrefill.phone}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      )}

      {/* Secret Admin Portal (Direct URL /techadmin/login) */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash.startsWith('#techadmin')) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          siteSettings={settings}
          packages={packages}
          faqs={faqs}
          onRefreshData={loadInitialData}
        />
      )}
    </div>
  );
}
