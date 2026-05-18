"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface TrackItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variant: { variantName: string; variantValue: string } | null;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  isActive: boolean;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes: string | null;
  shippingAddress: {
    fullName: string;
    area: string | null;
    city: string | null;
    country: string | null;
    addressLine: string;
  } | null;
  items: TrackItem[];
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "📦",
  processing: "⚙️",
  shipped: "🚚",
  delivered: "✅",
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") || "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [existingProof, setExistingProof] = useState<{ imageUrl: string; uploadedAt: string } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const doTrack = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    setExistingProof(null);
    setProofFile(null);
    setProofPreview(null);
    setUploadSuccess(false);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setOrder(data);
      // Fetch existing proof + payment settings in parallel
      const [proofRes, settingsRes] = await Promise.all([
        fetch(`/api/orders/payment-proof?orderId=${data.id}`),
        data.paymentStatus === "pending" ? fetch("/api/payment-settings") : Promise.resolve(null),
      ]);
      if (proofRes.ok) {
        const proof = await proofRes.json();
        if (proof) setExistingProof(proof);
      }
      if (settingsRes?.ok) {
        const ps = await settingsRes.json();
        setBankAccounts((ps.bankAccounts ?? []).filter((a: BankAccount) => a.isActive));
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only image files are accepted (JPG, PNG, WebP, GIF, AVIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleProofUpload = async () => {
    if (!proofFile || !order) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append("image", proofFile);
      const res = await fetch("/api/orders/payment-proof", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed."); return; }
      setExistingProof({ imageUrl: data.imageUrl, uploadedAt: new Date().toISOString() });
      setProofFile(null);
      setProofPreview(null);
      setUploadSuccess(true);
    } catch {
      setUploadError("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const num = searchParams.get("orderNumber");
    if (num) doTrack(num);
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doTrack(orderNumber);
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Enter your order number to see the latest status of your order.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-1747612345678-ABC123"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#704204] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="px-6 py-3 bg-[#704204] text-white rounded-xl text-sm font-semibold hover:bg-[#8a5626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Searching…" : "Track"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              {error}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-400">
            Your order number was emailed to you and is shown on your order confirmation page.
          </p>
        </form>

        {/* Order Result */}
        {order && (
          <div className="space-y-6">

            {/* Order Header */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{order.orderNumber}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-sm font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Order Status</h3>

              {isCancelled ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-semibold text-red-700">Order Cancelled</p>
                    <p className="text-sm text-red-500">This order has been cancelled.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-6 sm:mx-10" />
                  {/* Progress bar fill */}
                  <div
                    className="absolute top-5 left-0 h-1 bg-[#704204] mx-6 sm:mx-10 transition-all duration-500"
                    style={{
                      width: currentStep >= 0
                        ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`
                        : "0%",
                    }}
                  />
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const done = idx <= currentStep;
                      const active = idx === currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 w-1/4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                              done
                                ? "bg-[#704204] border-[#704204] text-white shadow-md"
                                : "bg-white border-gray-300 text-gray-300"
                            } ${active ? "ring-4 ring-[#704204]/20" : ""}`}
                          >
                            {done ? STATUS_ICONS[step] : "○"}
                          </div>
                          <div className="text-center">
                            <p className={`text-xs font-semibold leading-tight ${done ? "text-[#704204]" : "text-gray-400"}`}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Items</h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{item.productName}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {`${item.variant.variantName}: ${item.variant.variantValue}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-gray-900 flex-shrink-0">
                      Rs. {item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Shipping To</h3>
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>
                    {[order.shippingAddress.area, order.shippingAddress.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.shippingAddress.country && (
                    <p>{order.shippingAddress.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Rs. {Number(order.shippingFee).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>− Rs. {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-3 mt-1">
                  <span>Total</span>
                  <span>Rs. {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">Order Notes</h3>
                <p className="text-sm text-yellow-900">{order.notes}</p>
              </div>
            )}

            {/* Pay Now Banner — only when pending */}
            {order.paymentStatus === "pending" && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-base font-bold text-amber-900">Payment Required</h3>
                    <p className="text-sm text-amber-800 mt-0.5">
                      Your order is reserved but <strong>not confirmed</strong> until payment is received.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount Due</span>
                  <span className="text-lg font-bold text-gray-900">Rs. {Number(order.total).toFixed(2)}</span>
                </div>

                {/* COD */}
                {order.paymentMethod === "cod" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-800 mb-1">💵 Cash on Delivery</p>
                    <p className="text-sm text-green-700">You selected Cash on Delivery. Please keep Rs. {Number(order.total).toFixed(2)} ready when your order arrives.</p>
                  </div>
                )}

                {/* Bank Transfer */}
                {order.paymentMethod === "bank_transfer" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-3">🏦 Transfer to one of these accounts and use your order number as the reference:</p>
                    {bankAccounts.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Please contact us for bank account details.</p>
                    ) : (
                      <div className="space-y-3">
                        {bankAccounts.map((acc) => (
                          <div key={acc.id} className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="font-semibold text-gray-900 text-sm">{acc.bankName}</p>
                            <p className="text-sm text-gray-700">{acc.accountTitle}</p>
                            <p className="text-sm font-mono text-gray-900 mt-1 select-all">{acc.accountNumber}</p>
                            {acc.iban && <p className="text-xs text-gray-500 font-mono mt-0.5 select-all">IBAN: {acc.iban}</p>}
                            {acc.branch && <p className="text-xs text-gray-500 mt-0.5">Branch: {acc.branch}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-blue-800">Reference / Description to include:</p>
                      <p className="text-sm font-mono font-bold text-blue-900 mt-0.5 select-all">{order.orderNumber}</p>
                    </div>
                  </div>
                )}

                {/* Card */}
                {order.paymentMethod === "card" && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-purple-800 mb-1">💳 Card Payment</p>
                    <p className="text-sm text-purple-700">Please contact us to complete your card payment.</p>
                  </div>
                )}

                {/* Fallback */}
                {!order.paymentMethod && bankAccounts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-3">🏦 Pay via bank transfer:</p>
                    <div className="space-y-3">
                      {bankAccounts.map((acc) => (
                        <div key={acc.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="font-semibold text-gray-900 text-sm">{acc.bankName}</p>
                          <p className="text-sm font-mono text-gray-900 select-all">{acc.accountNumber}</p>
                          {acc.iban && <p className="text-xs text-gray-500 font-mono select-all">IBAN: {acc.iban}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Proof Upload — only when pending */}
            {order.paymentStatus === "pending" && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Payment Proof</h3>
                <p className="text-xs text-gray-500 mb-4">Upload a screenshot or photo of your payment receipt to help us verify your order faster.</p>

                {/* Existing proof */}
                {existingProof && (
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 mb-2">
                      Uploaded on {new Date(existingProof.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <img
                      src={existingProof.imageUrl}
                      alt="Payment proof"
                      className="max-w-full max-h-64 rounded-xl border border-gray-200 object-contain"
                    />
                    <p className="text-xs text-gray-400 mt-2">You can replace this by uploading a new image below.</p>
                  </div>
                )}

                {uploadSuccess && !existingProof && (
                  <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
                    ✓ Payment proof uploaded successfully!
                  </div>
                )}

                {/* Upload area */}
                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#704204] transition-colors bg-gray-50 hover:bg-amber-50">
                  <span className="text-3xl">🖼️</span>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">{proofFile ? proofFile.name : "Click to choose an image"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP, GIF — max 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Preview */}
                {proofPreview && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <img src={proofPreview} alt="Preview" className="max-h-48 rounded-xl border border-gray-200 object-contain" />
                  </div>
                )}

                {uploadError && (
                  <p className="mt-3 text-sm text-red-600">{uploadError}</p>
                )}

                {proofFile && (
                  <button
                    onClick={handleProofUpload}
                    disabled={uploading}
                    className="mt-4 w-full py-3 bg-[#704204] text-white rounded-xl text-sm font-semibold hover:bg-[#8a5626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading…" : "Submit Payment Proof"}
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#704204]" /></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
