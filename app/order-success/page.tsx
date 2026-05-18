"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Thank you for your order. We&apos;ll process it and ship it to you soon.
        </p>

        {orderNumber && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Your Order Number</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-semibold text-gray-900 text-sm break-all">{orderNumber}</span>
              <button
                onClick={handleCopy}
                title="Copy order number"
                className="flex-shrink-0 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Save this number to track your order.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orderNumber && (
            <Link
              href={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}`}
              className="block w-full bg-[#704204] text-white px-6 py-3 rounded-xl hover:bg-[#8a5626] transition-colors font-semibold text-sm"
            >
              Track My Order
            </Link>
          )}
          <Link
            href="/shop"
            className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
