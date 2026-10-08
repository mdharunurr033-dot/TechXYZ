import React, { useState, useEffect } from 'react';
import { Order, Package, SiteSettings, FAQItem, OrderStatus, PaymentStatus, ReelItem } from '../types';
import {
  adminLogin,
  adminVerifyOrderPayment,
  fetchAdminOrders,
  updateOrderStatus,
  updatePackage,
  updateSettings,
  uploadAdminVideo,
} from '../lib/api';
import {
  ShieldCheck,
  Lock,
  Search,
  CheckCircle,
  CheckCircle2,
  Video,
  LogOut,
  X,
  ExternalLink,
  Edit,
  Save,
  AlertCircle,
  Copy,
  Check,
  Eye,
  MapPin,
  Upload,
  Printer,
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  Layers,
  Settings as SettingsIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileVideo,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  siteSettings: SiteSettings;
  packages: Package[];
  faqs: FAQItem[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  siteSettings,
  packages,
  faqs,
  onRefreshData,
}) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('tpbd_admin_token') || '');
  const [username, setUsername] = useState('Techxyz');
  const [password, setPassword] = useState('tech02@0##');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dashboard Tabs: 'orders' | 'packages' | 'media' | 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'packages' | 'media' | 'settings'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterOrder, setFilterOrder] = useState('ALL');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Full Order Details Modal State (Eye button action)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Editing package modal
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  // Settings & Media form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Video uploader system states
  const [isUploadingHeroVideo, setIsUploadingHeroVideo] = useState(false);
  const [uploadingReelIndex, setUploadingReelIndex] = useState<number | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [heroPreviewMuted, setHeroPreviewMuted] = useState(true);
  const [reelsPreviewMuted, setReelsPreviewMuted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, filterPayment, filterOrder, searchQuery]);

  // Broadcast helper to notify all tabs and windows instantly
  const triggerInstantLiveSync = () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tpbd:datarefreshed'));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('tpbd_sync');
          bc.postMessage({ type: 'DATA_REFRESHED', timestamp: Date.now() });
          bc.close();
        }
        localStorage.setItem('tpbd_sync_time', Date.now().toString());
      }
    } catch (err) {
      console.warn('Sync broadcast warning:', err);
    }
  };

  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotification({ message, type });
    setTimeout(() => {
      setActionNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const loadOrders = async () => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const data = await fetchAdminOrders(token, {
        search: searchQuery,
        paymentStatus: filterPayment,
        orderStatus: filterOrder,
      });
      setOrders(data.orders);
      setTotalRevenue(data.revenueBDT);
      setPaidCount(data.paidCount);
      
      // Keep viewingOrder in sync if open
      if (viewingOrder) {
        const updatedViewing = data.orders.find((o) => o.id === viewingOrder.id);
        if (updatedViewing) setViewingOrder(updatedViewing);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Orders sync notice:', error?.message || error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await adminLogin({
        username: username.trim(),
        password: password.trim(),
      });
      if (res.success && res.token) {
        setToken(res.token);
        try {
          localStorage.setItem('tpbd_admin_token', res.token);
        } catch {}
        showNotification('Authenticated as administrator', 'success');
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (err: unknown) {
      setLoginError((err as Error).message || 'Invalid username or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('tpbd_admin_token');
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await adminVerifyOrderPayment(token, orderId);
      await loadOrders();
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder((prev) => prev ? { ...prev, paymentStatus: 'PAID', orderStatus: 'PROCESSING' } : null);
      }
      onRefreshData();
      triggerInstantLiveSync();
      showNotification('Payment verified and order confirmed successfully!', 'success');
    } catch (err: unknown) {
      showNotification((err as Error).message || 'Failed to verify payment', 'error');
    }
  };

  const handleStatusChange = async (orderId: string, orderStatus: OrderStatus, paymentStatus: PaymentStatus) => {
    try {
      await updateOrderStatus(token, orderId, { orderStatus, paymentStatus });
      await loadOrders();
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder((prev) => prev ? { ...prev, orderStatus, paymentStatus } : null);
      }
      onRefreshData();
      triggerInstantLiveSync();
      showNotification('Order status updated successfully', 'success');
    } catch {
      showNotification('Failed to update order status', 'error');
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      await updatePackage(token, editingPkg.id, editingPkg);
      setEditingPkg(null);
      onRefreshData();
      triggerInstantLiveSync();
      showNotification('Package updated successfully! Changes are live on website.', 'success');
    } catch {
      showNotification('Failed to update package', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(token, settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      onRefreshData();
      triggerInstantLiveSync();
      showNotification('Website settings updated live!', 'success');
    } catch {
      showNotification('Failed to update settings', 'error');
    }
  };

  const handleReelChange = (index: number, field: keyof ReelItem, value: string) => {
    const updatedReels = [...(settingsForm.reels || [])];
    if (updatedReels[index]) {
      updatedReels[index] = { ...updatedReels[index], [field]: value };
      setSettingsForm({ ...settingsForm, reels: updatedReels });
    }
  };

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHeroVideo(true);
    setUploadStatusMessage(`Uploading Hero Video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    try {
      const result = await uploadAdminVideo(token, file);
      if (result.success && result.videoUrl) {
        setSettingsForm((prev) => ({ ...prev, heroVideoUrl: result.videoUrl }));
        setUploadStatusMessage('Hero video uploaded successfully! Click Save Media Settings Live to apply.');
      }
    } catch (err: unknown) {
      console.warn('Server upload error, applying device data fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSettingsForm((prev) => ({ ...prev, heroVideoUrl: reader.result as string }));
          setUploadStatusMessage('Hero video loaded from device. Click Save Media Settings Live to apply.');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingHeroVideo(false);
      setTimeout(() => setUploadStatusMessage(null), 6000);
    }
  };

  const handleHeroPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettingsForm((prev) => ({ ...prev, heroVideoPoster: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReelVideoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReelIndex(index);
    setUploadStatusMessage(`Uploading Reel #${index + 1} video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    try {
      const result = await uploadAdminVideo(token, file);
      if (result.success && result.videoUrl) {
        handleReelChange(index, 'videoUrl', result.videoUrl);
        setUploadStatusMessage(`Reel #${index + 1} video uploaded successfully!`);
      }
    } catch (err: unknown) {
      console.warn('Server upload error, applying device data fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleReelChange(index, 'videoUrl', reader.result as string);
          setUploadStatusMessage(`Reel #${index + 1} video loaded from device.`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingReelIndex(null);
      setTimeout(() => setUploadStatusMessage(null), 6000);
    }
  };

  const handleReelThumbnailUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleReelChange(index, 'thumbnail', reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/techadmin/login` : '/techadmin/login';

  const copyAdminUrl = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(adminUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // If not logged in, show secure login modal
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Admin Portal Login
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Authorized management access for Tech Promotion BD.
          </p>

          <div className="mb-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="font-semibold text-slate-700">Secret URL: </span>
              <code className="text-blue-600 font-mono">/techadmin/login</code>
            </div>
            <button
              onClick={copyAdminUrl}
              type="button"
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Techxyz"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('Techxyz');
                    setPassword('tech02@0##');
                    if (loginError) setLoginError('');
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Auto-fill Techxyz
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left animate-in zoom-in-95 duration-150">
        {/* Dashboard Top Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-700 shrink-0">
              <img
                src="/logo.png"
                alt="Tech Promotion BD"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Tech Promotion BD</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40">
                  Control Desk
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Logged in as <strong className="text-slate-200">{username}</strong> · Instant Live Website Sync Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Orders Management</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === 'orders' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Packages & Image Edit</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Hero & 3 FB Reels</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <div className="ml-auto text-xs text-slate-400 hidden sm:flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Server Mode</span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {actionNotification && (
            <div
              className={`mb-4 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
                actionNotification.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              <span>{actionNotification.message}</span>
              <button
                onClick={() => setActionNotification(null)}
                className="p-1 hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Total Orders Placed</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Verified / Paid Orders</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{paidCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Total Verified Volume</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">৳{totalRevenue.toLocaleString()} BDT</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer, phone, location, link..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>

                  <select
                    value={filterOrder}
                    onChange={(e) => setFilterOrder(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="ALL">All Order Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-4">Customer & WhatsApp</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Service & Quantity</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment & Trx</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No orders found matching your search.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Order ID */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-bold text-blue-600 font-mono">{ord.orderNumber}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>

                            {/* Customer & WhatsApp */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-900">{ord.customerName}</p>
                              <a
                                href={`https://wa.me/${ord.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>{ord.whatsappNumber}</span>
                              </a>
                            </td>

                            {/* Client Location */}
                            <td className="py-3 px-4 max-w-[150px]">
                              <div className="flex items-start gap-1 text-[11px] text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span className="truncate block font-medium" title={ord.clientLocation || 'Bangladesh'}>
                                  {ord.clientLocation || 'Bangladesh'}
                                </span>
                              </div>
                            </td>

                            {/* Service & Quantity */}
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-800">{ord.packageName}</p>
                              <p className="text-[11px] text-slate-500">{ord.quantityDisplay}</p>
                              {ord.promoCode && (
                                <p className="text-[10px] text-emerald-600 font-medium">Promo: {ord.promoCode} (-৳{ord.discountApplied || 0})</p>
                              )}
                            </td>

                            {/* Total Price */}
                            <td className="py-3 px-4 whitespace-nowrap font-extrabold text-slate-900 tabular-nums">
                              ৳{ord.totalPrice.toLocaleString()}
                            </td>

                            {/* Payment Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ord.paymentStatus === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {ord.paymentStatus === 'PAID' ? 'Verified' : 'Pending Verification'}
                                </span>
                                <p className="text-[10px] text-slate-600 font-semibold">{ord.paymentMethod || 'bKash'}</p>
                                {ord.transactionId && (
                                  <p className="text-[10px] text-blue-600 font-mono font-bold truncate max-w-[110px]" title={ord.transactionId}>
                                    Trx: {ord.transactionId}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Delivery Status Selector */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(ord.id, e.target.value as OrderStatus, ord.paymentStatus)
                                }
                                className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions Column: Eye Button + Verify Button */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {/* Eye button to view full order details */}
                                <button
                                  onClick={() => setViewingOrder(ord)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                                  title="View full order details & client location"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Payment Verification Button */}
                                {ord.paymentStatus !== 'PAID' ? (
                                  <button
                                    onClick={() => handleVerifyPayment(ord.id)}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                    title="Verify customer payment and confirm order"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verify Payment</span>
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Confirmed</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGES (With Image Preview & Image Editing) */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Service Packages</h3>
                  <p className="text-xs text-slate-500">Edit package pricing, quantities, features, and upload/update package images.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Package Image Thumbnail */}
                      <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase">
                          {pkg.category} Category
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span className="text-blue-600 font-extrabold text-sm">৳{pkg.basePrice} BDT</span>
                        <span>{pkg.quantityLabel}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{pkg.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{pkg.description}</p>

                      <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <p>Quantity Step: <strong>{pkg.quantityStep.toLocaleString()}</strong></p>
                        <p>Price Step: <strong>৳{pkg.priceStep}</strong></p>
                        <p>Multiplier Enabled: <strong>{pkg.allowQuantityIncrease ? 'Yes' : 'No'}</strong></p>
                        {pkg.optionalOpportunity && (
                          <p>Opportunity: <strong>{pkg.optionalOpportunity}</strong></p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPkg(pkg)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Package & Image</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA (Hero Video & 3 FB Reels Video Uploader System) */}
          {activeTab === 'media' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              {settingsSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 border border-emerald-200 shadow-2xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Media configuration saved! Homepage Hero and Reels are instantly updated and live.</span>
                </div>
              )}

              {uploadStatusMessage && (
                <div className="p-3.5 bg-blue-50 text-blue-800 text-xs rounded-2xl flex items-center justify-between gap-2 border border-blue-200 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-blue-600 ${isUploadingHeroVideo || uploadingReelIndex !== null ? 'animate-spin' : ''}`} />
                    <span className="font-semibold">{uploadStatusMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadStatusMessage(null)}
                    className="p-1 text-blue-500 hover:text-blue-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 1. HERO VIDEO UPLOADER SYSTEM */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <span>Hero Section Video (Direct Uploader & Instant Player)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload from device or enter video URL. Supports MP4, WebM, large 500MB+ streams.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 shrink-0 self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto Start without sound · Sound on click</span>
                  </span>
                </div>

                {/* Hero Formula Rule Notification */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <strong className="text-blue-600 block">📌 Hero Playback Formula:</strong>
                  <p className="text-[11px] text-slate-600">
                    Site open hole video auto-start hobe <strong>without sound (muted)</strong>. Visitor video te click korle kono pop-up chhara <strong>sound soho direct play hobe</strong>.
                  </p>
                </div>

                {/* Live Hero Video Preview Player with Sound Test */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Live 16:9 Video Preview:</span>
                    <button
                      type="button"
                      onClick={() => setHeroPreviewMuted(!heroPreviewMuted)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        heroPreviewMuted
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white border-emerald-500'
                      }`}
                    >
                      {heroPreviewMuted ? (
                        <>
                          <VolumeX className="w-3 h-3 text-slate-500" />
                          <span>Preview Muted (Site Open Default)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-white animate-pulse" />
                          <span>Sound ON (Visitor Clicked Test)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
                    {settingsForm.heroVideoUrl ? (
                      <video
                        key={settingsForm.heroVideoUrl}
                        src={settingsForm.heroVideoUrl}
                        poster={settingsForm.heroVideoPoster}
                        autoPlay
                        muted={heroPreviewMuted}
                        loop
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs p-4 text-center">
                        <FileVideo className="w-8 h-8 text-slate-500 mb-2" />
                        <span>No video URL configured yet. Upload a video file or choose a preset below.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero Video Controls: Upload Button & Direct URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Device File Uploader */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Option A: Upload Video File from Device
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select MP4 or WebM video file from your computer or phone.
                    </p>
                    <label
                      className={`cursor-pointer w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs ${
                        isUploadingHeroVideo
                          ? 'bg-blue-100 text-blue-700 border-blue-300 pointer-events-none'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <Upload className={`w-4 h-4 text-blue-600 ${isUploadingHeroVideo ? 'animate-bounce' : ''}`} />
                      <span>{isUploadingHeroVideo ? 'Uploading Video...' : 'Choose Video File from Device'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        disabled={isUploadingHeroVideo}
                        onChange={handleHeroVideoUpload}
                      />
                    </label>
                  </div>

                  {/* Direct Video URL */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Option B: Direct Video URL or CDN Stream
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Paste direct link to MP4/WebM video hosted anywhere.
                    </p>
                    <input
                      type="url"
                      value={settingsForm.heroVideoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                      placeholder="https://.../video.mp4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                {/* Quick Presets for Hero Video */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Or Select High-Speed Ready Demo Videos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        label: 'Cinematic Blazes (Default)',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                      },
                      {
                        label: 'Organic Growth Showcase',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                      },
                      {
                        label: 'Fast Delivery Campaign',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                      },
                    ].map((demo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, heroVideoUrl: demo.url })}
                        className={`p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          settingsForm.heroVideoUrl === demo.url
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block truncate font-semibold">{demo.label}</span>
                        <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5">{demo.url}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Poster Image */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Hero Video Poster Image (Thumbnail before load)
                    </label>
                    <label className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Poster Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroPosterUpload}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.heroVideoPoster || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoPoster: e.target.value })}
                    placeholder="/src/assets/images/hero_cinematic_banner_1791233752016.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* 2. CLIENT GROWTH STORIES & LIVE REELS SECTION (Same Formula) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <span>Client Growth Stories & Live Reels (Same Formula)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage the 3 vertical 9:16 reels displayed on the homepage with video uploader system and sound test.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto Start without sound · Sound on click</span>
                  </span>
                </div>

                {/* Reels Formula Rule Notification */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <strong className="text-blue-600 block">📌 Reels Formula Rule:</strong>
                  <p className="text-[11px] text-slate-600">
                    Home page open hole vertical reel video gulo <strong>without sound (muted) auto-start hobe</strong>. Customer je kono reel e click korle <strong>sound soho instant play hobe kono pop-up chara</strong>!
                  </p>
                </div>

                {/* 3 Reels Cards with 9:16 Vertical Live Preview & Device Uploader */}
                <div className="space-y-6">
                  {(settingsForm.reels || []).slice(0, 3).map((reel, idx) => {
                    const isMuted = reelsPreviewMuted[idx] ?? true;
                    const isUploadingThisReel = uploadingReelIndex === idx;

                    return (
                      <div
                        key={reel.id || idx}
                        className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                              Reel #{idx + 1} · {reel.title || 'Untitled Reel'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {reel.id}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                          {/* Left: 9:16 Vertical Video Preview with Sound Tester */}
                          <div className="md:col-span-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">9:16 Live Preview:</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setReelsPreviewMuted((prev) => ({ ...prev, [idx]: !isMuted }))
                                }
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                                  isMuted
                                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                                    : 'bg-emerald-600 text-white border-emerald-500'
                                }`}
                              >
                                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 animate-pulse" />}
                                <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
                              </button>
                            </div>

                            <div className="relative aspect-9/16 max-w-[200px] mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
                              {reel.videoUrl ? (
                                <video
                                  key={reel.videoUrl}
                                  src={reel.videoUrl}
                                  poster={reel.thumbnail}
                                  autoPlay
                                  muted={isMuted}
                                  loop
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={reel.thumbnail}
                                  alt={reel.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] text-white font-bold pointer-events-none">
                                <span className="bg-black/60 px-1.5 py-0.5 rounded-md">{reel.views || '100K+'}</span>
                                <span className="bg-black/60 px-1.5 py-0.5 rounded-md">{reel.duration || '0:45'}</span>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold pointer-events-none drop-shadow-md">
                                <p className="truncate font-bold">{reel.title}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Reel Inputs & Video/Thumbnail Uploaders */}
                          <div className="md:col-span-8 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Reel Title
                                </label>
                                <input
                                  type="text"
                                  value={reel.title}
                                  onChange={(e) => handleReelChange(idx, 'title', e.target.value)}
                                  placeholder="e.g. 500K Views Delivery Proof"
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Subtitle / Bengali Description
                                </label>
                                <input
                                  type="text"
                                  value={reel.subtitle}
                                  onChange={(e) => handleReelChange(idx, 'subtitle', e.target.value)}
                                  placeholder="e.g. ১০০% অর্গানিক বুস্ট ও লাইভ ভিউ কাউন্ট"
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                                />
                              </div>
                            </div>

                            {/* Video Uploader & URL for Reel */}
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-slate-800">
                                  Reel Video Source (Upload or URL)
                                </label>
                                <label
                                  className={`cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                                    isUploadingThisReel
                                      ? 'bg-blue-100 text-blue-700 border-blue-300 pointer-events-none'
                                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  }`}
                                >
                                  <Upload className={`w-3.5 h-3.5 text-blue-600 ${isUploadingThisReel ? 'animate-bounce' : ''}`} />
                                  <span>{isUploadingThisReel ? 'Uploading...' : 'Upload Reel Video from Device'}</span>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    disabled={isUploadingThisReel}
                                    onChange={(e) => handleReelVideoUpload(idx, e)}
                                  />
                                </label>
                              </div>
                              <input
                                type="url"
                                value={reel.videoUrl || ''}
                                onChange={(e) => handleReelChange(idx, 'videoUrl', e.target.value)}
                                placeholder="https://example.com/reel-vertical.mp4"
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                              />
                            </div>

                            {/* Thumbnail Uploader & URL */}
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-slate-800">
                                  Thumbnail / Poster Image
                                </label>
                                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Upload Thumbnail</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleReelThumbnailUpload(idx, e)}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={reel.thumbnail}
                                onChange={(e) => handleReelChange(idx, 'thumbnail', e.target.value)}
                                placeholder="/src/assets/images/reel_thumb.jpg or https://..."
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                              />
                            </div>

                            {/* Views & Duration Badges */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Views Badge Display
                                </label>
                                <input
                                  type="text"
                                  value={reel.views || ''}
                                  onChange={(e) => handleReelChange(idx, 'views', e.target.value)}
                                  placeholder="e.g. 250K+ Views"
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Duration Display
                                </label>
                                <input
                                  type="text"
                                  value={reel.duration || ''}
                                  onChange={(e) => handleReelChange(idx, 'duration', e.target.value)}
                                  placeholder="e.g. 0:45"
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save All Media Settings Live Button */}
              <div className="pt-2 sticky bottom-0 bg-slate-50/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
                <div className="text-xs text-slate-600 font-medium hidden sm:block">
                  Changes save to database immediately and broadcast to all site visitors.
                </div>
                <button
                  type="submit"
                  className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all ml-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Media Settings Live (Instant Website Sync)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Site & Contact Configuration
              </h3>

              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Site settings updated and live!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary WhatsApp Support
                  </label>
                  <input
                    type="text"
                    value={settingsForm.primaryWhatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Promo Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.promoCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    placeholder="TechPromotionBD"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.tagline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Delivered Views Stat
                  </label>
                  <input
                    type="text"
                    value={settingsForm.statTotalViews}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statTotalViews: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Engagements Stat
                  </label>
                  <input
                    type="text"
                    value={settingsForm.statTotalEngagement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statTotalEngagement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings Live</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: ORDER FULL DETAILS MODAL (Eye Button Action)    */}
        {/* ======================================================== */}
        {viewingOrder && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order ID:</span>
                    <span className="text-base font-black text-blue-600 font-mono">{viewingOrder.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Created on {new Date(viewingOrder.createdAt).toLocaleDateString()} at {new Date(viewingOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      viewingOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viewingOrder.paymentStatus === 'PAID' ? 'Verified (PAID)' : 'Pending Approval'}
                  </span>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Client & Contact Information (With Prominent Location) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Customer & Client Location</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Customer Name:</span>
                    <strong className="text-slate-800 text-sm">{viewingOrder.customerName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">WhatsApp Mobile:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-slate-800 font-mono">{viewingOrder.whatsappNumber}</strong>
                      <a
                        href={`https://wa.me/${viewingOrder.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px] font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>

                  {/* Client Geographic & Network Location */}
                  <div className="sm:col-span-2 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                        Captured Client Location & Network IP
                      </span>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5 font-mono">
                        {viewingOrder.clientLocation || 'Bangladesh (Network Detected)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service & Financials */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Service Package & Pricing
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Package:</span>
                    <strong className="text-slate-800">{viewingOrder.packageName}</strong>
                    <span className="text-[10px] text-slate-400 block uppercase">Category: {viewingOrder.category}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Volume / Quantity:</span>
                    <strong className="text-slate-800">{viewingOrder.quantityDisplay}</strong>
                    <span className="text-[10px] text-slate-500 block">Multiplier: {viewingOrder.multiplier}x</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Total Amount:</span>
                    <strong className="text-emerald-600 font-extrabold text-base">৳{viewingOrder.totalPrice.toLocaleString()} BDT</strong>
                    {viewingOrder.promoCode && (
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        Promo: {viewingOrder.promoCode} (-৳{viewingOrder.discountApplied || 0})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Links Submitted */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Submitted Social Media Links
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Primary Target Link:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={viewingOrder.serviceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-mono truncate max-w-md block"
                      >
                        {viewingOrder.serviceLink}
                      </a>
                      <button
                        onClick={() => copyToClipboard(viewingOrder.serviceLink, 'primaryLink')}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer"
                        title="Copy Link"
                      >
                        {copiedText === 'primaryLink' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {viewingOrder.pageLink && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Facebook Page / Profile:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={viewingOrder.pageLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline font-mono truncate max-w-md block"
                        >
                          {viewingOrder.pageLink}
                        </a>
                        <button
                          onClick={() => copyToClipboard(viewingOrder.pageLink || '', 'pageLink')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedText === 'pageLink' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {viewingOrder.videoLinks && viewingOrder.videoLinks.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[11px] block">Video Links ({viewingOrder.videoLinks.length}):</span>
                      {viewingOrder.videoLinks.map((vl, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">#{i + 1}</span>
                          <a
                            href={vl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-600 hover:underline font-mono truncate max-w-md block"
                          >
                            {vl}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {viewingOrder.additionalLinks && viewingOrder.additionalLinks.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[11px] block">Extra Opportunity Links:</span>
                      {viewingOrder.additionalLinks.map((al, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">+{idx + 1}</span>
                          <a
                            href={al}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-mono truncate max-w-md block"
                          >
                            {al}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method & Trx Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Payment Verification Details
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Payment Method:</span>
                    <strong className="text-slate-800">{viewingOrder.paymentMethod || 'bKash'}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Transaction ID (TrxID):</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-blue-600 font-mono text-sm">{viewingOrder.transactionId || 'Awaiting TrxID'}</strong>
                      {viewingOrder.transactionId && (
                        <button
                          onClick={() => copyToClipboard(viewingOrder.transactionId || '', 'trxId')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer"
                          title="Copy TrxID"
                        >
                          {copiedText === 'trxId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {viewingOrder.customerNotes && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[11px] block">Customer Special Instructions:</span>
                      <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 text-xs mt-1">
                        {viewingOrder.customerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Status Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Order Delivery Status:</span>
                  <select
                    value={viewingOrder.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(viewingOrder.id, e.target.value as OrderStatus, viewingOrder.paymentStatus)
                    }
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {viewingOrder.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleVerifyPayment(viewingOrder.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Payment & Confirm Order</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={() => setViewingOrder(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: EDIT PACKAGE MODAL (With Image URL / Upload)    */}
        {/* ======================================================== */}
        {editingPkg && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Edit Package & Image</h3>
                <button onClick={() => setEditingPkg(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                {/* 1. Image Editing Section */}
                <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block font-bold text-slate-800 text-xs">
                    Package Image (Preview & Custom Upload)
                  </label>

                  {/* Image Preview */}
                  <div className="relative aspect-video w-full rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
                    {editingPkg.image ? (
                      <img
                        src={editingPkg.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No image provided
                      </div>
                    )}
                  </div>

                  {/* Image URL text input */}
                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Direct Image URL or Path:
                    </label>
                    <input
                      type="text"
                      value={editingPkg.image}
                      onChange={(e) => setEditingPkg({ ...editingPkg, image: e.target.value })}
                      placeholder="Enter image link (e.g. /src/assets/images/... or https://...)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>

                  {/* Upload Image from Device */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditingPkg({ ...editingPkg, image: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP supported</span>
                  </div>

                  {/* Quick Preset Selector */}
                  <div className="pt-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Or Choose Pre-made Graphics:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Video Boost', src: '/src/assets/images/facebook_views_service_1791232714396.jpg' },
                        { label: '30K Views', src: '/src/assets/images/entry_views_30k_1791233952025.jpg' },
                        { label: '50K Views', src: '/src/assets/images/entry_views_50k_1791233968798.jpg' },
                        { label: '10K Growth', src: '/src/assets/images/core_growth_10k_1791233981134.jpg' },
                        { label: '30K Suite', src: '/src/assets/images/core_growth_30k_1791233991383.jpg' },
                        { label: '100K Followers', src: '/src/assets/images/prem_followers_100k_1791234003256.jpg' },
                        { label: '500K Authority', src: '/src/assets/images/prem_followers_500k_1791234014820.jpg' },
                        { label: '1M VIP', src: '/src/assets/images/vip_galaxy_1m_1791234027353.jpg' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingPkg({ ...editingPkg, image: preset.src })}
                          className={`p-1 rounded-lg border text-left transition-all cursor-pointer ${
                            editingPkg.image === preset.src
                              ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-100'
                          }`}
                        >
                          <div className="aspect-video w-full rounded overflow-hidden mb-0.5">
                            <img src={preset.src} alt={preset.label} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] text-slate-700 truncate block text-center font-medium">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Package Details */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingPkg.category}
                      onChange={(e) => setEditingPkg({ ...editingPkg, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold bg-white"
                    >
                      <option value="entry">Entry (৳50 – ৳499)</option>
                      <option value="core">Core (৳999 – ৳4,999)</option>
                      <option value="premium">Premium (৳5,000 – ৳35,000)</option>
                      <option value="vip">VIP (৳40,000 – ৳100,000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Label</label>
                    <input
                      type="text"
                      value={editingPkg.quantityLabel}
                      onChange={(e) => setEditingPkg({ ...editingPkg, quantityLabel: e.target.value })}
                      placeholder="e.g. 50,000 Views"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Price (৳)</label>
                    <input
                      type="number"
                      required
                      value={editingPkg.basePrice}
                      onChange={(e) => setEditingPkg({ ...editingPkg, basePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price Step (৳)</label>
                    <input
                      type="number"
                      value={editingPkg.priceStep}
                      onChange={(e) => setEditingPkg({ ...editingPkg, priceStep: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Quantity</label>
                    <input
                      type="number"
                      value={editingPkg.baseQuantity}
                      onChange={(e) => setEditingPkg({ ...editingPkg, baseQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Step</label>
                    <input
                      type="number"
                      value={editingPkg.quantityStep}
                      onChange={(e) => setEditingPkg({ ...editingPkg, quantityStep: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingPkg.description}
                    onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Opportunity Text</label>
                    <input
                      type="text"
                      value={editingPkg.optionalOpportunity || ''}
                      onChange={(e) => setEditingPkg({ ...editingPkg, optionalOpportunity: e.target.value })}
                      placeholder="e.g. Up to 5 Videos"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Popular Badge</label>
                    <select
                      value={editingPkg.popularBadge || ''}
                      onChange={(e) => setEditingPkg({ ...editingPkg, popularBadge: e.target.value as any || undefined })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">No Badge</option>
                      <option value="Popular">Popular</option>
                      <option value="Best Value">Best Value</option>
                      <option value="Flash Discount">Flash Discount</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowIncrease"
                    checked={editingPkg.allowQuantityIncrease}
                    onChange={(e) => setEditingPkg({ ...editingPkg, allowQuantityIncrease: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="allowIncrease" className="font-semibold text-slate-700 cursor-pointer">
                    Allow Unlimited Volume Increase Multiplier
                  </label>
                </div>

                <div className="pt-3 flex gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Save Changes (Instant Live)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
