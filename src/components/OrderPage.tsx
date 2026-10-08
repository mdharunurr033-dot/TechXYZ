import React, { useState, useEffect } from 'react';
import { Package, Order } from '../types';
import { createOrder } from '../lib/api';
import { analytics } from '../lib/analytics';
import { BrandLogo } from './BrandLogo';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  MapPin,
  Link2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Lock,
  MessageCircle,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface OrderPageProps {
  packages: Package[];
  initialPackage?: Package | null;
  initialMultiplier?: number;
  onBackToHome: () => void;
  onOrderCreated: (order: Order) => void;
  primaryWhatsapp?: string;
}

const DISTRICT_PRESETS = [
  'Gaibandha',
  'Dhaka',
  'Rangpur',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Bogura',
  'Khulna',
  'Mymensingh',
  'Barishal',
  'Comilla',
  'Dinajpur',
];

export const OrderPage: React.FC<OrderPageProps> = ({
  packages,
  initialPackage,
  initialMultiplier = 1,
  onBackToHome,
  onOrderCreated,
  primaryWhatsapp = '+8801601300122',
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackage?.id || packages[0]?.id || ''
  );
  const [multiplier, setMultiplier] = useState<number>(initialMultiplier);
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [clientLocation, setClientLocation] = useState('');

  // Service-specific link inputs
  const [pageLink, setPageLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment method selection & Transaction ID
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Promo Code State (TechPromotionBD)
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Sync initialPackage when passed
  useEffect(() => {
    if (initialPackage?.id) {
      setSelectedPkgId(initialPackage.id);
    }
  }, [initialPackage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    analytics.pageView('CheckoutPage');
  }, []);

  const currentPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Dynamic calculations based on unlimited multiplier system
  const rawPrice = currentPkg
    ? currentPkg.allowQuantityIncrease
      ? currentPkg.basePrice + (multiplier - 1) * currentPkg.priceStep
      : currentPkg.basePrice
    : 0;

  const currentQuantity = currentPkg
    ? currentPkg.allowQuantityIncrease
      ? currentPkg.baseQuantity + (multiplier - 1) * currentPkg.quantityStep
      : currentPkg.baseQuantity
    : 0;

  const formattedQuantity = currentPkg
    ? currentPkg.allowQuantityIncrease
      ? `${currentQuantity.toLocaleString()} ${currentPkg.quantityLabel.replace(/^[0-9,]+/, '').trim()}`
      : currentPkg.quantityLabel
    : '';

  // 10% rate reduction on promo code
  const discountAmount = appliedPromo ? Math.round(rawPrice * 0.10) : 0;
  const finalPrice = Math.max(1, rawPrice - discountAmount);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (code === 'TECHPROMOTIONBD' || code === 'PROMO10' || code === 'ORGANIC') {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Use code "TechPromotionBD"');
    }
  };

  const handleAddLink = () => {
    if (additionalLinks.length < 5) {
      setAdditionalLinks([...additionalLinks, '']);
    }
  };

  const handleRemoveLink = (index: number) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, val: string) => {
    const updated = [...additionalLinks];
    updated[index] = val;
    setAdditionalLinks(updated);
  };

  const getPaymentNumber = () => {
    if (paymentMethod === 'bKash') return '01601300122';
    if (paymentMethod === 'Nagad') return '01601300122';
    if (paymentMethod === 'Rocket') return '01601300122-8';
    return '01601300122';
  };

  const copyPaymentNumber = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(getPaymentNumber());
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid WhatsApp phone number (e.g., 017XXXXXXXX).');
      return;
    }

    if (!clientLocation.trim()) {
      setErrorMsg('Please specify your district or city location.');
      return;
    }

    const primaryLink = (pageLink || videoLink).trim();
    if (!primaryLink) {
      setErrorMsg('Please provide your target Facebook Page, Video, or Post URL.');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('Please provide your mobile banking Transaction ID (TrxID) for Admin payment verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const videoLinksList = [
        ...(videoLink.trim() ? [videoLink.trim()] : []),
        ...additionalLinks.filter((l) => l.trim().length > 0),
      ];

      const res = await createOrder({
        customerName: customerName.trim(),
        whatsappNumber: cleanPhone,
        clientLocation: clientLocation.trim() || undefined,
        serviceLink: primaryLink,
        pageLink: pageLink.trim() || undefined,
        videoLinks: videoLinksList.length > 0 ? videoLinksList : undefined,
        additionalLinks: additionalLinks.filter((l) => l.trim().length > 0),
        packageId: currentPkg.id,
        multiplier: multiplier,
        customerNotes: customerNotes.trim() || undefined,
        promoCode: appliedPromo || undefined,
        paymentMethod: paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
      });

      if (!res.success || !res.order) {
        throw new Error(res.message || 'Failed to submit order.');
      }

      // Order created in PENDING state awaiting admin approval
      onOrderCreated(res.order);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error).message || 'Something went wrong while submitting your order. Please check connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <BrandLogo size="md" showText={false} />
              <span className="font-extrabold text-slate-900 tracking-tight text-sm hidden md:inline">
                Tech Promotion BD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Verified Delivery</span>
            </span>

            <a
              href={`https://wa.me/${primaryWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Helpdesk</span>
            </a>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      {showPromoBanner && !appliedPromo && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 text-center text-xs font-medium shadow-inner flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-300" />
            <span>
              Use promo code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">TechPromotionBD</strong> for instant rate discount!
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleApplyPromo('TechPromotionBD')}
            className="px-2.5 py-0.5 bg-white text-blue-700 font-extrabold rounded-md text-[11px] hover:bg-blue-50 cursor-pointer"
          >
            Apply Now
          </button>
          <button
            type="button"
            onClick={() => setShowPromoBanner(false)}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Order Checkout · No Password Required</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Complete Your Service Order
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Submit your Facebook promotion details and payment TrxID. Tech Promotion BD admin will manually review and verify your campaign for immediate delivery.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs sm:text-sm font-semibold rounded-2xl border border-red-200 flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          {/* Left Column (8 cols): Order Information Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: Package Selector & Quantity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>Select Service Package</span>
                </h2>
                <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {currentPkg.category} tier
                </span>
              </div>

              {/* Package Dropdown Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Growth Service:
                </label>
                <div className="relative">
                  <select
                    value={selectedPkgId}
                    onChange={(e) => {
                      setSelectedPkgId(e.target.value);
                      setMultiplier(1);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 pr-10 cursor-pointer"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — {pkg.quantityLabel} (৳{pkg.basePrice.toLocaleString()} BDT)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Selected Package Details Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                  <img
                    src={currentPkg.image}
                    alt={currentPkg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm">{currentPkg.name}</h3>
                    <span className="font-black text-blue-600 text-sm">৳{rawPrice.toLocaleString()} BDT</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{currentPkg.description}</p>
                  {currentPkg.optionalOpportunity && (
                    <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ★ {currentPkg.optionalOpportunity}
                    </span>
                  )}
                  {currentPkg.category === 'ads' && (
                    <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900">Ads Expert: Harun Ur Rashid Mizan</strong> (+8801601300122)
                        <div className="text-slate-600">Rates: Meta Ads 1$ = BDT 133.20 | Google Ads 1$ = BDT 167.69 (Min $20)</div>
                      </div>
                      <a
                        href={`https://wa.me/${primaryWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shrink-0 text-xs"
                      >
                        <span>WhatsApp Chat</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Stepper (if multiplier allowed) */}
              {currentPkg.allowQuantityIncrease && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Volume Multiplier:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Scale delivery volume as needed
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                      disabled={multiplier <= 1}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4 text-slate-700" />
                    </button>
                    <span className="text-sm font-black font-mono w-8 text-center">
                      {multiplier}x
                    </span>
                    <button
                      type="button"
                      onClick={() => setMultiplier(multiplier + 1)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Customer Information & Location */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>Customer Information & Location</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Client Location Input with Quick District Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Your Location / District (Bangladesh) <span className="text-red-500">*</span></span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">For order record & verification</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  placeholder="e.g. Gaibandha, Dhaka, Rangpur, Bogura..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 mb-2"
                />

                {/* Quick District Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
                    Quick Pick:
                  </span>
                  {DISTRICT_PRESETS.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setClientLocation(dist)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        clientLocation === dist
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: Target Social Media Links */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>Target Social Media Links</span>
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Video / Reel / Page URL <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="url"
                  required
                  value={pageLink || videoLink}
                  onChange={(e) => {
                    setPageLink(e.target.value);
                    setVideoLink(e.target.value);
                  }}
                  placeholder="https://www.facebook.com/watch/?v=... or page link"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Make sure your video post or Facebook page is set to <strong>Public</strong> so views can be delivered.
                </p>
              </div>

              {/* Additional Links (Optional) */}
              {additionalLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleUpdateLink(idx, e.target.value)}
                    placeholder={`Additional Video Link #${idx + 2}`}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={additionalLinks.length >= 4}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Video Link (Split Views)</span>
                </button>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Notes / Specific Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Mention any custom distribution, pacing, or notes..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* SECTION 4: Payment Method & Verification */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span>Payment Method & Transaction ID</span>
                </h2>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Admin Verification
                </span>
              </div>

              {/* Payment Selector: bKash / Nagad / Rocket */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'bKash', label: 'bKash Personal', color: 'border-pink-500 text-pink-600 bg-pink-50/50' },
                  { id: 'Nagad', label: 'Nagad Personal', color: 'border-orange-500 text-orange-600 bg-orange-50/50' },
                  { id: 'Rocket', label: 'Rocket Personal', color: 'border-purple-500 text-purple-600 bg-purple-50/50' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      paymentMethod === m.id
                        ? `${m.color} ring-2 ring-blue-500 shadow-xs font-black scale-[1.02]`
                        : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Account Numbers Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Send ৳{finalPrice} BDT via {paymentMethod} (Send Money):
                  </span>
                  <button
                    type="button"
                    onClick={copyPaymentNumber}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'Copied Number!' : 'Copy Number'}</span>
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between font-mono text-base font-extrabold text-blue-600">
                  <span>{getPaymentNumber()}</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">Personal Account</span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Send Money to the number above and copy your Transaction ID (TrxID) from SMS or App. Enter it below.
                </p>
              </div>

              {/* Transaction ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Transaction ID (TrxID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 9K72BXYZ or BDT123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tech Promotion BD Admin manually checks this TrxID before starting delivery.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Order Summary & Submit */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {currentPkg.category.toUpperCase()}
                </span>
              </h3>

              {/* Itemized Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Selected Service:</span>
                  <strong className="text-slate-800 font-bold text-right max-w-[200px]">{currentPkg.name}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Quantity Volume:</span>
                  <span className="font-bold text-slate-800">{formattedQuantity}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment Channel:</span>
                  <span className="font-bold text-slate-800">{paymentMethod}</span>
                </div>

                {clientLocation && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Location:</span>
                    <span className="font-semibold text-slate-700">{clientLocation}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Subtotal Rate:</span>
                  <span className="font-semibold text-slate-800">৳{rawPrice.toLocaleString()} BDT</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Discount ({appliedPromo}):</span>
                    <span>-৳{discountAmount.toLocaleString()} BDT</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-slate-900">Total Payable:</span>
                  <span className="text-2xl font-black text-emerald-600 tabular-nums">
                    ৳{finalPrice.toLocaleString()} <span className="text-xs font-bold text-slate-500">BDT</span>
                  </span>
                </div>
              </div>

              {/* Promo Code Input Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="PROMO CODE (TechPromotionBD)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[11px] text-emerald-600 font-bold">
                    ✓ Promo {appliedPromo} applied successfully!
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-600 font-semibold">{promoError}</p>
                )}
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Order Details...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Order (Pending Admin Approval)</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

              {/* Security & Guarantees */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Organic & Non-Drop Delivery Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admin Verification & Live Order Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24/7 WhatsApp Assistance across Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
