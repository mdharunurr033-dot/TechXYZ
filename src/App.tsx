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
import { OrderPage } from './components/OrderPage';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminDashboard } from './components/AdminDashboard';
import { analytics } from './lib/analytics';

export default function App() {
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Dedicated Page Routing: 'home' | 'order'
  const [currentView, setCurrentView] = useState<'home' | 'order'>(() => {
    if (typeof window !== 'undefined') {
      const p = (window.location.pathname || '').toLowerCase();
      const h = (window.location.hash || '').toLowerCase();
      if (p.startsWith('/order') || h.startsWith('#order')) return 'order';
    }
    return 'home';
  });

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  // Track order modal state
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderPrefill, setTrackOrderPrefill] = useState<{ orderId: string; phone?: string }>({
    orderId: '',
    phone: '',
  });

  // Confirmed / submitted order modal awaiting admin approval (All Details & Export Modal)
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

    // Route sync handler for back / forward navigation
    const handlePopState = () => {
      checkSecretAdminRoute();
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      if (path.startsWith('/order') || hash.startsWith('#order')) {
        setCurrentView('order');
      } else {
        setCurrentView('home');
      }
    };

    // Check immediately on mount
    checkSecretAdminRoute();

    // Handle instant data refresh events
    const handleDataRefreshed = () => {
      loadInitialData();
    };

    window.addEventListener('tpbd:datarefreshed', handleDataRefreshed);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('popstate', handlePopState);
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
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
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

  // Open dedicated Order Page (new page view instead of modal popup)
  const handleOpenOrder = (pkg?: Package, multiplier: number = 1) => {
    setSelectedPackage(pkg || packages[0]);
    setSelectedMultiplier(multiplier);
    setCurrentView('order');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'order' }, '', '/order');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (pkg) {
      analytics.viewContent(pkg.name, pkg.category, pkg.basePrice);
    }
  };

  // Return to Home view
  const handleBackToHome = () => {
    setCurrentView('home');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'home' }, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // When order is submitted from OrderPage, show all details popup with export options
  const handleOrderCreated = (order: Order) => {
    setConfirmedOrder(order);
  };

  const handleTrackFromSuccess = (orderId: string, phone?: string) => {
    setConfirmedOrder(null);
    setTrackOrderPrefill({ orderId, phone: phone || '' });
    setIsTrackOrderOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
      {/* View 1: Dedicated New Order Checkout Page */}
      {currentView === 'order' ? (
        <OrderPage
          packages={packages}
          initialPackage={selectedPackage}
          initialMultiplier={selectedMultiplier}
          onBackToHome={handleBackToHome}
          onOrderCreated={handleOrderCreated}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      ) : (
        /* View 2: Complete Homepage */
        <>
          {/* Header */}
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

          {/* Footer */}
          <Footer settings={settings} />

          {/* Mobile Sticky CTA Bar */}
          <MobileStickyCTA
            onOrderNowClick={() => handleOpenOrder()}
            primaryWhatsapp={settings.primaryWhatsapp}
          />
        </>
      )}

      {/* POPUP MODAL: All Order Details & Multi-Format Export Options */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => {
            setConfirmedOrder(null);
            handleBackToHome();
          }}
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

      {/* Secret Admin Portal (Direct URL domain/techadmin/login) */}
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
