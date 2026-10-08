import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { SiteSettings } from '../types';
import { MessageCircle, Mail, MapPin, X, Send, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  const cleanPrimaryWa = settings.primaryWhatsapp.replace(/[^0-9]/g, '');
  const cleanAltWa = settings.alternativeWhatsapp.replace(/[^0-9]/g, '');

  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Prominent Contact Info Section Added Directly Into Footer */}
        <div className="bg-slate-800/80 rounded-3xl p-8 sm:p-10 border border-slate-700/80 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
              Customer Helpdesk & Offices
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Contact Tech Promotion BD
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              100% organic social media services provider — since 2021. Reach us anytime 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary & Alternative WhatsApp */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">WhatsApp Support (24/7)</h3>
                <p className="text-xs text-slate-400 mb-3">Fastest response for orders & queries</p>
                <div className="space-y-1">
                  <p className="text-sm font-black text-white font-mono">{settings.primaryWhatsapp}</p>
                  <p className="text-xs text-slate-400 font-mono">Alt: {settings.alternativeWhatsapp}</p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800">
                <a
                  href={`https://wa.me/${cleanPrimaryWa}?text=${encodeURIComponent('Hello Tech Promotion BD, I would like to consult on social media promotion.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Support Email */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Official Email</h3>
                <p className="text-xs text-slate-400 mb-3">For enterprise contracts & business inquiries</p>
                <p className="text-sm font-black text-white break-all">{settings.email}</p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800">
                <a
                  href={`mailto:${settings.email}?subject=Tech%20Promotion%20BD%20Inquiry`}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Office Address */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Physical Office Address</h3>
                <p className="text-xs text-slate-400 mb-3">Gaibandha Sadar, Rangpur Division</p>
                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                  {settings.address}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Gaibandha, Bangladesh</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation & Legal Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-8 border-b border-slate-800 text-slate-400 text-xs">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-2.5 bg-white inline-block rounded-2xl shadow-md border border-slate-700/80">
              <BrandLogo size="lg" showText={false} />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.tagline}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Organic & Non-Drop Verified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Services</p>
            <ul className="space-y-1.5">
              <li><a href="#packages" className="hover:text-white transition-colors">Entry Packages (৳50+)</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors">Core Growth Packages</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors">Premium Followers</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors">VIP Enterprise Growth</a></li>
              <li><a href="#ads-packages" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1">★ Meta & Google Ads (Min $20)</a></li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Policies</p>
            <ul className="space-y-1.5">
              <li><button onClick={() => setModalType('terms')} className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setModalType('refund')} className="hover:text-white transition-colors cursor-pointer">Refund Policy</button></li>
            </ul>
          </div>

          {/* Support Info */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Helpdesk</p>
            <p className="text-xs text-slate-400">
              WhatsApp Support: {settings.primaryWhatsapp}
            </p>
            <p className="text-xs text-slate-400">
              Email: {settings.email}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              24/7 dedicated campaign assistance & tracking verification.
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Tech Promotion BD. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Bangladesh BDT (৳)</span>
            <span>·</span>
            <span>bKash · Nagad · Rocket Verified</span>
            <span>·</span>
            <span>100% Organic Services</span>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto text-left">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'terms' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Terms & Conditions</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                  <p>1. <strong>Organic Delivery:</strong> All promotional views and engagements provided by Tech Promotion BD are sourced from organic advertising networks.</p>
                  <p>2. <strong>Public Visibility:</strong> Customers must ensure target Facebook pages, profiles, or video posts remain public throughout delivery.</p>
                  <p>3. <strong>Payment:</strong> All orders are verified by Admin via official mobile banking channels (bKash, Nagad, or Rocket) using your submitted Transaction ID (TrxID).</p>
                </div>
              </div>
            )}

            {modalType === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Privacy Policy</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                  <p>1. <strong>Data Collected:</strong> We only collect customer names, WhatsApp contact numbers, and public social URLs for fulfilling order requests.</p>
                  <p>2. <strong>Security:</strong> We never request account passwords or administrative access to your social media profiles.</p>
                  <p>3. <strong>Confidentiality:</strong> Financial references and campaign data are kept strictly confidential and never shared with third parties.</p>
                </div>
              </div>
            )}

            {modalType === 'refund' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Refund Policy & Service Guarantee</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 leading-relaxed">
                  <p>1. <strong>Global Server & Algorithm Updates:</strong> If any delivery interruption or temporary issue occurs due to global social platform algorithm updates or server maintenance, customers may either switch to an alternative replacement service of equal value or cooperate with some additional patience. As soon as global servers return to normal status, the campaign will be resumed and 100% completed.</p>
                  <p>2. <strong>Alternative Service Option:</strong> If a specific server line faces prolonged downtime due to platform-wide updates, clients have the flexibility to exchange their balance for another active service category (such as views, follower growth, or engagements) via our 24/7 WhatsApp helpdesk.</p>
                  <p>3. <strong>Queue Priority & Server Normalization:</strong> Orders during platform updates remain secure in our priority delivery queue and will be fulfilled completely once server stability normalizes.</p>
                  <p>4. <strong>Invalid or Private Links:</strong> If an incorrect or private link is provided, our team will contact you via WhatsApp to update the link before processing.</p>
                  <p>5. <strong>Refill & Completion Warranty:</strong> All premium follower and engagement packages come with our standard retention refill guarantee.</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
