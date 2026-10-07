import React, { useState } from 'react';
import { Order } from '../types';
import {
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Copy,
  Check,
  FileText,
  FileCode,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  onTrackOrder?: (orderId: string, phone?: string) => void;
  primaryWhatsapp?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  primaryWhatsapp = '+8801601300122',
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const cleanPhone = primaryWhatsapp.replace(/[^0-9]/g, '');

  const waMessage = encodeURIComponent(
    `Hello Tech Promotion BD,\n\nI have placed an order and submitted my payment TrxID!\n\nOrder ID: ${order.orderNumber}\nCustomer: ${order.customerName}\nWhatsApp: ${order.whatsappNumber}\nLocation: ${order.clientLocation || 'Not Specified'}\nService: ${order.packageName}\nQuantity: ${order.quantityDisplay}\nTotal: ৳${order.totalPrice} BDT\nMethod: ${order.paymentMethod || 'bKash'}\nTrxID: ${order.transactionId || 'Awaiting Verification'}\nTarget Link: ${order.serviceLink}\n\nPlease verify payment and approve my order.`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  // 1. Export as HTML Invoice
  const handleDownloadHtmlInvoice = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber} | Tech Promotion BD</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }
    .invoice-card { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 900; color: #0f172a; }
    .brand span { color: #2563eb; }
    .badge { background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fde68a; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 12px; }
    .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .table th, .table td { padding: 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table th { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .total-row { font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; }
    @media print {
      body { background: #fff; margin: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">Tech Promotion <span>BD</span></div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">100% Organic Social Media Growth Services · Since 2021</div>
      </div>
      <div>
        <span class="badge">${order.paymentStatus === 'PAID' ? 'PAID & CONFIRMED' : 'PENDING ADMIN APPROVAL'}</span>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <strong style="color: #64748b; text-transform: uppercase; font-size: 11px;">Customer Information:</strong><br>
        <strong>${order.customerName}</strong><br>
        WhatsApp: ${order.whatsappNumber}<br>
        Location: ${order.clientLocation || 'Not Specified'}
      </div>
      <div style="text-align: right;">
        <strong style="color: #64748b; text-transform: uppercase; font-size: 11px;">Order Identification:</strong><br>
        <strong>Order ID: ${order.orderNumber}</strong><br>
        Date: ${new Date(order.createdAt).toLocaleDateString()}<br>
        Payment: ${order.paymentMethod || 'bKash'} (${order.transactionId || 'Awaiting Verification'})
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Service Package</th>
          <th>Quantity</th>
          <th style="text-align: right;">Amount (BDT)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${order.packageName}</strong><br>
            <small style="color: #2563eb; word-break: break-all;">${order.serviceLink}</small>
          </td>
          <td>${order.quantityDisplay}</td>
          <td style="text-align: right;">৳${order.totalPrice.toLocaleString()}</td>
        </tr>
        ${
          order.discountApplied
            ? `
        <tr style="color: #16a34a;">
          <td colspan="2">Promo Discount (${order.promoCode || 'TechPromotionBD'})</td>
          <td style="text-align: right;">-৳${order.discountApplied.toLocaleString()}</td>
        </tr>`
            : ''
        }
        <tr class="total-row">
          <td colspan="2">Total Amount</td>
          <td style="text-align: right; color: #16a34a;">৳${order.totalPrice.toLocaleString()} BDT</td>
        </tr>
      </tbody>
    </table>

    ${
      order.customerNotes
        ? `
    <div style="background: #f8fafc; padding: 14px; border-radius: 10px; font-size: 13px; margin: 16px 0;">
      <strong style="color: #64748b; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 4px;">Customer Notes:</strong>
      ${order.customerNotes}
    </div>`
        : ''
    }

    <div class="footer">
      College Road, Thana Para, Gaibandha Sadar, Rangpur, Bangladesh - 5700<br>
      WhatsApp Support: +8801601300122 | Email: techpromotionbd@gmail.com<br>
      Thank you for choosing Tech Promotion BD! Your order is queued for Admin Verification.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Export as Text Receipt (.txt)
  const handleDownloadTxtReceipt = () => {
    const textContent = `================================================
           TECH PROMOTION BD - ORDER RECEIPT
================================================
Order ID:        ${order.orderNumber}
Order Status:    ${order.paymentStatus === 'PAID' ? 'PAID & CONFIRMED' : 'PENDING ADMIN APPROVAL'}
Date:            ${new Date(order.createdAt).toLocaleString()}

CUSTOMER DETAILS:
Name:            ${order.customerName}
WhatsApp:        ${order.whatsappNumber}
Location:        ${order.clientLocation || 'Not Specified'}

SERVICE ORDERED:
Package:         ${order.packageName}
Quantity:        ${order.quantityDisplay}
Target Link:     ${order.serviceLink}
${order.videoLinks && order.videoLinks.length > 0 ? `Additional Links: \n${order.videoLinks.join('\n')}\n` : ''}
PAYMENT DETAILS:
Method:          ${order.paymentMethod || 'bKash'}
Transaction ID:  ${order.transactionId || 'Awaiting Verification'}
Total Amount:    ${order.totalPrice} BDT (৳)
${order.discountApplied ? `Promo Applied:   ${order.promoCode} (-৳${order.discountApplied})\n` : ''}
${order.customerNotes ? `Customer Notes:  ${order.customerNotes}\n` : ''}
================================================
Support WhatsApp: +8801601300122
Website:          Tech Promotion BD
================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${order.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Export as JSON Data (.json)
  const handleDownloadJsonData = () => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order-${order.orderNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. Copy All Order Details to Clipboard
  const handleCopyAllDetails = () => {
    const textToCopy = `Tech Promotion BD - Order Details
Order ID: ${order.orderNumber}
Status: Pending Admin Approval
Customer: ${order.customerName}
WhatsApp: ${order.whatsappNumber}
Location: ${order.clientLocation || 'N/A'}
Service: ${order.packageName} (${order.quantityDisplay})
Target Link: ${order.serviceLink}
Payment Method: ${order.paymentMethod || 'bKash'}
TrxID: ${order.transactionId || 'Awaiting Verification'}
Total Amount: ৳${order.totalPrice} BDT
Date: ${new Date(order.createdAt).toLocaleString()}`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedText('all');
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const handleCopySingle = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-6 animate-in zoom-in-95 duration-200">
        {/* Success Banner */}
        <div className="p-6 text-center space-y-2 relative overflow-hidden text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
          <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Order Placed Successfully!</h3>
          <p className="text-xs text-white/90 font-medium max-w-md mx-auto">
            Your order has been submitted with TrxID. Status is currently <strong>Pending Admin Approval</strong>. You can export or track your order below.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-5 sm:p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
          {/* Order ID & Status Badge */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order ID</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-black text-blue-600 font-mono tabular-nums">
                  {order.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySingle(order.orderNumber, 'orderId')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedText === 'orderId' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Admin Approval</span>
              </span>
            </div>
          </div>

          {/* Itemized Detailed Specifications (All Details) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 divide-y divide-slate-200/70 text-xs sm:text-sm">
            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Customer Name:</span>
              <strong className="text-slate-800 font-bold">{order.customerName}</strong>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">WhatsApp Number:</span>
              <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                <span>{order.whatsappNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopySingle(order.whatsappNumber, 'wa')}
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                  title="Copy Phone"
                >
                  {copiedText === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {order.clientLocation && (
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Client Location:</span>
                </span>
                <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {order.clientLocation}
                </span>
              </div>
            )}

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Service Package:</span>
              <span className="font-extrabold text-blue-600 text-right">{order.packageName}</span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Delivered Quantity:</span>
              <span className="font-bold text-slate-800">{order.quantityDisplay}</span>
            </div>

            <div className="py-2 flex justify-between items-start gap-3">
              <span className="text-slate-500 font-medium shrink-0">Target URL:</span>
              <a
                href={order.serviceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline max-w-[240px] truncate flex items-center gap-1"
              >
                <span className="truncate">{order.serviceLink}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod || 'bKash'}</span>
            </div>

            {order.transactionId && (
              <div className="py-2 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Transaction ID (TrxID):</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                  <span>{order.transactionId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopySingle(order.transactionId || '', 'trx')}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy TrxID"
                  >
                    {copiedText === 'trx' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            {order.customerNotes && (
              <div className="py-2">
                <span className="text-slate-500 font-medium block text-xs mb-1">Customer Instructions:</span>
                <p className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 text-xs">
                  {order.customerNotes}
                </p>
              </div>
            )}

            <div className="py-2.5 flex justify-between items-baseline text-base font-extrabold">
              <span className="text-slate-900">Total Amount:</span>
              <span className="text-emerald-600 text-xl font-black tabular-nums">
                ৳{order.totalPrice.toLocaleString()} BDT
              </span>
            </div>
          </div>

          {/* EXPORT OPTIONS SECTION (detils export option soho) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export & Download Details</span>
              </span>
              <button
                type="button"
                onClick={handleCopyAllDetails}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'all' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All Details</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDownloadHtmlInvoice}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download HTML / PDF printable invoice"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>HTML / Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxtReceipt}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download text receipt"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Text Receipt (.txt)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJsonData}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Export JSON order data"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>JSON Data</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            {/* Live Track Order Button */}
            {onTrackOrder && (
              <button
                type="button"
                onClick={() => onTrackOrder(order.orderNumber, order.whatsappNumber)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Track Your Order Live (Awaiting Verification)</span>
              </button>
            )}

            {/* Direct WhatsApp Share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order ID to WhatsApp Helpdesk</span>
            </a>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
