import React, { useState } from 'react';
import { Package } from '../types';
import {
  Sparkles,
  Calculator,
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';

interface MetaGoogleAdsSectionProps {
  onSelectPackage?: (pkg: Package, multiplier: number) => void;
  adsPackages?: Package[];
  primaryWhatsapp?: string;
}

export const META_ADS_RATE = 133.20; // 1$ = BDT 133.20
export const GOOGLE_ADS_RATE = 167.69; // 1$ = BDT 167.69

export const MetaGoogleAdsSection: React.FC<MetaGoogleAdsSectionProps> = ({
  onSelectPackage,
  adsPackages = [],
  primaryWhatsapp = '+8801601300122',
}) => {
  const [platform, setPlatform] = useState<'meta' | 'google'>('meta');
  const [budgetUSD, setBudgetUSD] = useState<number>(20); // Minimum 20$
  const [campaignGoal, setCampaignGoal] = useState<string>('Post & Reel Boost');
  const [customInput, setCustomInput] = useState<string>('20');

  const currentRate = platform === 'meta' ? META_ADS_RATE : GOOGLE_ADS_RATE;
  const currentTotalBDT = Math.round(budgetUSD * currentRate);

  const cleanWhatsappNumber = primaryWhatsapp.replace(/[^0-9]/g, '');

  const presetBudgets = [20, 30, 50, 75, 100, 150, 200, 500];

  const handleBudgetChange = (amount: number) => {
    const validAmount = Math.max(20, amount);
    setBudgetUSD(validAmount);
    setCustomInput(validAmount.toString());
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 20) {
      setBudgetUSD(parsed);
    }
  };

  const handleBlurCustomInput = () => {
    const parsed = parseFloat(customInput);
    if (isNaN(parsed) || parsed < 20) {
      setBudgetUSD(20);
      setCustomInput('20');
    } else {
      setBudgetUSD(parsed);
      setCustomInput(parsed.toString());
    }
  };

  // WhatsApp pre-composed message
  const platformName = platform === 'meta' ? 'Meta Ads (Facebook & Instagram)' : 'Google Ads (Search & YouTube)';
  const whatsappMessage = encodeURIComponent(
    `Hello Harun Ur Rashid Mizan Bhai (Ads Expert),\n` +
    `I want to run a ${platformName} boost campaign.\n\n` +
    `📌 Budget: $${budgetUSD} USD\n` +
    `💵 Rate: 1$ = ৳${currentRate.toFixed(2)} BDT\n` +
    `💰 Total in BDT: ৳${currentTotalBDT.toLocaleString('en-BD')} BDT\n` +
    `🎯 Campaign Goal: ${campaignGoal}\n\n` +
    `Please advise on target audience setup and start my boost.`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${whatsappMessage}`;

  const handleOrderOnline = () => {
    if (!onSelectPackage) return;

    // Find corresponding package or create custom package object
    const targetPkgId = platform === 'meta' ? 'ads-pkg-1' : 'ads-pkg-2';
    const foundPkg = adsPackages.find((p) => p.id === targetPkgId) || {
      id: targetPkgId,
      name: `${platform === 'meta' ? 'Meta Ads' : 'Google Ads'} Boost ($${budgetUSD})`,
      category: 'ads' as const,
      quantityLabel: `$${budgetUSD} Boost (৳${currentTotalBDT.toLocaleString('en-BD')})`,
      baseQuantity: budgetUSD,
      basePrice: currentTotalBDT,
      quantityStep: 5,
      priceStep: Math.round(5 * currentRate),
      allowQuantityIncrease: true,
      image: '/logo.png',
      description: `${platformName} campaign managed by Ads Expert Harun Ur Rashid Mizan. Rate: $1 = ৳${currentRate.toFixed(2)} BDT.`,
      optionalOpportunity: 'Facebook Page / Video / YouTube / Website',
      features: [
        `Platform: ${platformName}`,
        `Budget: $${budgetUSD} USD (৳${currentTotalBDT.toLocaleString('en-BD')} BDT)`,
        `Rate: 1$ = BDT ${currentRate.toFixed(2)}`,
        `Minimum 20$ to Any Custom Amount`,
        `Ads Expert: Harun Ur Rashid Mizan (+8801601300122)`
      ]
    };

    onSelectPackage(foundPkg, 1);
  };

  // Approximate reach calculation based on USD
  const estimatedReachMin = Math.round(budgetUSD * (platform === 'meta' ? 850 : 650));
  const estimatedReachMax = Math.round(budgetUSD * (platform === 'meta' ? 2200 : 1800));

  return (
    <section id="ads-packages" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Sponsored Ads Management</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Meta Ads & Google Ads
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 mt-1">
              Professional Boosting Service
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Take your Facebook, Instagram, and YouTube reach to the next level with official Meta & Google ad accounts. Managed directly by Certified Ads Expert <strong className="text-white font-semibold">Harun Ur Rashid Mizan</strong>.
          </p>
        </div>

        {/* Live Rates & Rules High-Impact Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Rate 1: Meta Ads */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-blue-500/30 shadow-lg relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Meta Ads Rate</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              1$ = <span className="text-blue-400">BDT 133.20</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Facebook & Instagram Sponsored Posts, Reels, Leads & Messages
            </p>
          </div>

          {/* Rate 2: Google Ads */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden group hover:border-indigo-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Google Ads Rate</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              1$ = <span className="text-indigo-400">BDT 167.69</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Google Search Top-Ranking, YouTube Video Ads & Display Network
            </p>
          </div>

          {/* Package 1 Limits */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Package 1 Limits</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Verified</span>
            </div>
            <div className="text-lg font-black text-white">
              Min <span className="text-emerald-400">20$</span> — Max <span className="text-emerald-400">100$</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Custom Boost: Min 20$ to Any Kind Of Budget
            </p>
          </div>

          {/* Dedicated Ads Expert */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/30 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Ads Expert</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Harun Ur Rashid Mizan</span>
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-emerald-400 font-bold">+8801601300122</span>
              <span className="text-[11px] text-slate-400">WhatsApp 24/7</span>
            </div>
          </div>
        </div>

        {/* Main Interactive Grid: Calculator (Left) + Package & Expert Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Currency & Budget Calculator (7 cols) */}
          <div className="lg:col-span-7 bg-slate-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-750 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-750">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Live Boosting Budget Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time BDT conversion at official exchange rates
                  </p>
                </div>
              </div>

              {/* Verified Rate Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Fixed Rate Guaranteed
              </span>
            </div>

            {/* Platform Selection Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                1. Select Advertising Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform('meta')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    platform === 'meta'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm sm:text-base">Meta Ads</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 text-white">
                      FB & IG
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-blue-400">
                    Rate: 1$ = BDT 133.20
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Post Boost, Video Views, Page Likes, Leads
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('google')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    platform === 'google'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm sm:text-base">Google Ads</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">
                      Search & YT
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-400">
                    Rate: 1$ = BDT 167.69
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Google Search Keywords, YouTube Video Views
                  </span>
                </button>
              </div>
            </div>

            {/* Budget Presets & Custom Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  2. Select Budget in USD (Minimum $20 to Any Amount)
                </label>
                <span className="text-xs font-bold text-emerald-400">
                  Min $20 · Max $100 (Pack 1) or Custom
                </span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                {presetBudgets.map((val) => {
                  const isSelected = budgetUSD === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleBudgetChange(val)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                      }`}
                    >
                      ${val}
                    </button>
                  );
                })}
              </div>

              {/* Slider & Exact Custom Input */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-slate-400 font-medium">Custom USD Budget:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl sm:text-2xl font-black text-white">$</span>
                      <input
                        type="number"
                        min="20"
                        step="1"
                        value={customInput}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        onBlur={handleBlurCustomInput}
                        className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-lg font-black text-white focus:outline-hidden focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">USD</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Equivalent in BDT:</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                      ৳{currentTotalBDT.toLocaleString('en-BD')} <span className="text-xs text-slate-400">BDT</span>
                    </div>
                  </div>
                </div>

                {/* Range Slider for fast browsing (20 to 200) */}
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={Math.min(200, Math.max(20, budgetUSD))}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>Min: $20</span>
                  <span>$50</span>
                  <span>Max Pack 1: $100</span>
                  <span>Custom: $200+</span>
                </div>
              </div>
            </div>

            {/* Campaign Goal Selection */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                3. Primary Campaign Objective
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Post & Reel Boost',
                  'Page Followers & Likes',
                  'WhatsApp Lead Gen',
                  'Video Views Surge',
                  'Website Sales & Traffic',
                  'YouTube Subscribers & Views'
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setCampaignGoal(goal)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                      campaignGoal === goal
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 border-slate-700/80 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-800 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Estimated Impressions / Audience Reach:</span>
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  ~{estimatedReachMin.toLocaleString('en-BD')} – {estimatedReachMax.toLocaleString('en-BD')}+ Targeted People
                </div>
                <div className="text-[11px] text-slate-400">
                  Rate applied: 1$ = ৳{currentRate.toFixed(2)} BDT
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* 1-Click WhatsApp Order */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Expert</span>
                </a>

                {/* Direct Online Order */}
                {onSelectPackage && (
                  <button
                    type="button"
                    onClick={handleOrderOnline}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-lg hover:shadow-blue-600/30 cursor-pointer"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Packeg 1 Features & Ads Expert Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Official Package 1 Summary Card */}
            <div className="bg-slate-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-750 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                  Official Boosting
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Packeg 1
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Meta & Google Boosting
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Guaranteed safe, 100% policy-compliant sponsored promotion for creator pages, business brands, and YouTube channels.
              </p>

              {/* Package 1 Specs Breakdown */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 font-semibold">Minimum Boost:</span>
                  <span className="font-extrabold text-white text-sm">20$ USD</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 font-semibold">Maximum Boost (Pack 1):</span>
                  <span className="font-extrabold text-white text-sm">100$ USD</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 font-semibold">Custom Boost:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">Min 20$ to Any Kind Of Budget</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 font-semibold">Meta Ads Rate:</span>
                  <span className="font-extrabold text-blue-400">1$ = BDT 133.20</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-slate-400 font-semibold">Google Ads Rate:</span>
                  <span className="font-extrabold text-indigo-400">1$ = BDT 167.69</span>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-5 pt-4 border-t border-slate-750 space-y-2">
                {[
                  'Demographic & Location targeting (Bangladesh or Worldwide)',
                  'Full Pixel, Event & Conversion tracking setup',
                  'Non-drop organic engagement and genuine views',
                  'Daily analytics & live budget consumption reports',
                  'Dedicated WhatsApp direct communication with ads expert'
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Ads Expert Profile & Direct Contact Box */}
            <div className="bg-gradient-to-br from-slate-850 to-slate-900 rounded-3xl p-6 sm:p-7 border border-blue-500/30 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/20">
                    HM
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-base font-extrabold text-white">
                      Harun Ur Rashid Mizan
                    </h5>
                  </div>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                    Senior Meta & Google Ads Expert
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Tech Promotion BD Certified Ad Account Manager
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Direct WhatsApp:</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>+8801601300122</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Alternative Phone:</span>
                  <a
                    href="tel:+8801601300122"
                    className="font-mono font-semibold text-slate-200 hover:underline"
                  >
                    01601300122
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turnaround Time:</span>
                  <span className="font-semibold text-slate-200">Ad Active within 1–3 Hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat WhatsApp</span>
                </a>

                <a
                  href="tel:+8801601300122"
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-650 font-extrabold text-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>Call Expert</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
