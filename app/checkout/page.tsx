"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPrimaryThumbnail } from "@/lib/thumbnail-utils";
import SearchableDropdown from "@/components/SearchableDropdown";

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  isActive: boolean;
}

interface CardGateway {
  id: string;
  gatewayName: string;
  displayName: string;
  publicKey: string;
  isTestMode: boolean;
  isActive: boolean;
}

interface PaymentSettings {
  methods: {
    cod: { enabled: boolean; label: string };
    bank_transfer: { enabled: boolean; label: string };
    card: { enabled: boolean; label: string };
  };
  bankAccounts: BankAccount[];
  cardGateways: CardGateway[];
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    isOnSale: boolean;
    thumbnail: string | null;
    stock: number;
  };
}

// Country, City, and Area data
const COUNTRIES = [
  "Pakistan", "United States", "United Kingdom", "Canada", "Australia",
  "UAE", "Saudi Arabia", "India", "Bangladesh", "Sri Lanka",
  "Malaysia", "Singapore", "Germany", "France", "Italy",
  "Japan", "South Korea", "China", "Netherlands", "Spain"
];

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Sukkur", "Larkana", "Abbottabad", "Sargodha",
  "Jhelum", "Sheikhupura", "Mardan", "Mianwali", "Bahawalpur"
];

const KARACHI_AREAS = [
  "Clifton", "DHA", "Gulshan-e-Iqbal", "North Nazimabad", "Gulistan-e-Jauhar",
  "PECHS", "Bahadurabad", "Liaquatabad", "North Karachi", "Gulshan-e-Hadeed",
  "Malir", "Korangi", "Landhi", "Shah Faisal Colony", "Jinnah Post",
  "Saddar", "Garden", "Jamshed Road", "Gulberg", "Federal B Area",
  "Nazimabad", "North Nazimabad", "Buffer Zone", "Gulshan-e-Maymar", "Scheme 33"
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChoice, setShowChoice] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    area: "",
    postalCode: "",
    addressLine: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "card">("cod");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // Dynamic city and area options based on country/city selection
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);

  // Update city options when country changes
  useEffect(() => {
    if (formData.country === "Pakistan") {
      setCityOptions(PAKISTAN_CITIES);
    } else {
      setCityOptions(["City 1", "City 2", "City 3"]); // Default for other countries
    }
  }, [formData.country]);

  // Fetch areas from GeoNames API when city changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (!formData.city) {
        setAreaOptions([]);
        return;
      }

      try {
        // Get country code for GeoNames API
        const countryCode = formData.country === "Pakistan" ? "PK" : formData.country.slice(0, 2).toUpperCase();
        const response = await fetch(
          `/api/geonames?q=${encodeURIComponent(formData.city)}&country=${countryCode}`
        );

        if (response.ok) {
          const data = await response.json();
          const areas = data.geonames?.map((item: { toponymName: string }) => item.toponymName) || [];
          setAreaOptions(areas);
        } else {
          // Fallback to default areas if API fails
          setAreaOptions(["Area 1", "Area 2", "Area 3"]);
        }
      } catch (error) {
        console.error("Error fetching areas from GeoNames:", error);
        setAreaOptions(["Area 1", "Area 2", "Area 3"]); // Fallback
      }
    };

    fetchAreas();
  }, [formData.city, formData.country]);

  // Generate or get session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    fetchCart();
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch("/api/payment-settings");
      if (res.ok) setPaymentSettings(await res.json());
    } catch {}
  };

  const fetchCart = async () => {
    // Try sessionStorage first — cart page writes here after every qty/remove change
    try {
      const stored = sessionStorage.getItem('cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore parse errors, fall through to API
    }

    // Fallback: fetch from API (e.g. user landed directly on /checkout)
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/cart", {
        headers: {
          "x-session-id": sessionId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayPrice = (item: CartItem) => {
    const product = item.product;
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;

    if (product.isOnSale && salePrice) {
      return salePrice;
    }
    return price;
  };

  const getProductImage = (product: CartItem['product']): string => {
    if (product.thumbnail) {
      return getPrimaryThumbnail(product.thumbnail) || '/images/placeholder.jpg';
    }
    return '/images/placeholder.jpg';
  };

  const isFormComplete =
    !!formData.fullName.trim() &&
    !!formData.email.trim() &&
    !!formData.phone.trim() &&
    !!formData.country.trim() &&
    !!formData.city.trim() &&
    !!formData.area.trim() &&
    !!formData.postalCode.trim() &&
    !!formData.addressLine.trim();

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + displayPrice(item) * item.quantity;
  }, 0);

  const shippingFee = 250;
  const total = subtotal + shippingFee;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          ...formData,
          subtotal,
          shippingFee,
          total,
          cartItems,
          paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Clear cart
        localStorage.removeItem("session_id");
        sessionStorage.removeItem("cart_items");
        window.dispatchEvent(new Event('cartUpdate'));
        router.push(`/order-success?orderId=${data.orderId}&orderNumber=${encodeURIComponent(data.orderNumber)}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show choice screen first
  if (showChoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
          
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Checkout Option</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full text-gray-900 py-3 px-6 rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors font-semibold"
                >
                  Login
                </button>
                
                <button
                  onClick={() => router.push("/register")}
                  className="w-full text-gray-900 py-3 px-6 rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors font-semibold"
                >
                  Register
                </button>
                
                <button
                  onClick={() => {
                    setShowChoice(false);
                    setIsGuest(true);
                  }}
                  className="w-full text-gray-900 py-3 px-6 rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors font-semibold"
                >
                  Continue as Guest
                </button>
              </div>
              
              <Link
                href="/shop"
                className="inline-block mt-6 text-blue-600 hover:text-blue-800"
              >
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Checkout</h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Cash on Delivery */}
                  {paymentSettings?.methods.cod.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        paymentMethod === "cod"
                          ? "border-[#704204] bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">💵</span>
                      <span className="text-sm font-medium text-gray-800">Cash on Delivery</span>
                    </button>
                  )}

                  {/* Bank Transfer */}
                  {paymentSettings?.methods.bank_transfer.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        paymentMethod === "bank_transfer"
                          ? "border-[#704204] bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">🏦</span>
                      <span className="text-sm font-medium text-gray-800">Bank Transfer</span>
                    </button>
                  )}

                  {/* Card Payment */}
                  {paymentSettings?.methods.card.enabled ? (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        paymentMethod === "card"
                          ? "border-[#704204] bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">💳</span>
                      <span className="text-sm font-medium text-gray-800">
                        {paymentSettings.cardGateways?.find((g) => g.isActive)?.displayName || "Card Payment"}
                      </span>
                    </button>
                  ) : (
                    <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed text-center">
                      <span className="text-2xl">💳</span>
                      <span className="text-sm font-medium text-gray-500">Card Payment</span>
                      <span className="absolute -top-2 right-2 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                  )}
                </div>

                {/* Bank Details Panel */}
                {paymentMethod === "bank_transfer" && paymentSettings && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-3">Transfer to one of the following accounts and include your order number in the reference:</p>
                    {paymentSettings.bankAccounts.filter((a) => a.isActive).length === 0 ? (
                      <p className="text-sm text-blue-600 italic">Bank account details will be provided after order placement. Please contact us.</p>
                    ) : (
                      <div className="space-y-3">
                        {paymentSettings.bankAccounts
                          .filter((a) => a.isActive)
                          .map((account) => (
                            <div key={account.id} className="bg-white rounded-lg p-3 border border-blue-100">
                              <p className="font-semibold text-gray-900 text-sm">{account.bankName}</p>
                              <div className="mt-1 space-y-0.5 text-sm text-gray-700">
                                <p><span className="text-gray-500">Account Title:</span> {account.accountTitle}</p>
                                <p><span className="text-gray-500">Account No:</span> <span className="font-mono font-medium">{account.accountNumber}</span></p>
                                {account.iban && <p><span className="text-gray-500">IBAN:</span> <span className="font-mono">{account.iban}</span></p>}
                                {account.branch && <p><span className="text-gray-500">Branch:</span> {account.branch}</p>}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <SearchableDropdown
                    name="country"
                    label="Country"
                    value={formData.country}
                    onChange={handleDropdownChange}
                    options={COUNTRIES}
                    required
                    placeholder="Select or type country..."
                  />

                  <SearchableDropdown
                    name="city"
                    label="City"
                    value={formData.city}
                    onChange={handleDropdownChange}
                    options={cityOptions}
                    required
                    placeholder="Select or type city..."
                  />

                  <SearchableDropdown
                    name="area"
                    label="Area"
                    value={formData.area}
                    onChange={handleDropdownChange}
                    options={areaOptions}
                    required
                    placeholder="Select or type area..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line *
                    </label>
                    <textarea
                      name="addressLine"
                      required
                      rows={3}
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isFormComplete}
                  className="w-full mt-6 bg-[#704204] text-white py-3 px-6 rounded-lg hover:bg-[#8a5626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
                {!isFormComplete && (
                  <p className="text-xs text-center text-gray-400 mt-2">Please fill in all required fields to continue.</p>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        QTY: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      Rs. {(displayPrice(item) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Rs. {shippingFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    Rs. {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
