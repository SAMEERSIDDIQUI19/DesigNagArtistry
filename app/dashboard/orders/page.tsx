"use client";

import { useEffect, useState } from "react";
import { getPrimaryThumbnail } from "@/lib/thumbnail-utils";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface OrderDetail extends Order {
  subtotal: number;
  shippingFee: number;
  discount: number;
  notes: string | null;
  user: { name: string; email: string; phone?: string } | null;
  shippingAddress: {
    fullName: string;
    phone: string | null;
    country: string | null;
    city: string | null;
    area: string | null;
    postalCode: string | null;
    addressLine: string;
  } | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    variant: { variantName: string; variantValue: string } | null;
    product: { thumbnail: string | null; slug: string } | null;
  }[];
  payments: { provider: string | null; status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setOrders(await response.json());
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setSelectedOrder(await response.json());
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (response.ok) {
        setOrders(orders.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o)));
        if (selectedOrder?.id === id) {
          setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : prev);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter((o) => filter === "all" || o.orderStatus === filter);

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204] text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#704204]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-stone-50 cursor-pointer transition-colors"
                    onClick={() => openOrderDetail(order.id)}
                  >
                    <td className="py-3 px-4 font-semibold text-sm text-[#704204]">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm">{order.user?.name || "Guest"}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || "-"}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-sm">Rs. {Number(order.total).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#704204]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Slide Panel */}
      {(selectedOrder || detailLoading) && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-stone-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Loading…"}
                </h2>
                {selectedOrder && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#704204]" />
              </div>
            ) : selectedOrder && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Status Badges + Update */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedOrder.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                  {selectedOrder.payments?.[0]?.provider && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
                      {selectedOrder.payments[0].provider}
                    </span>
                  )}
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="ml-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Customer Info */}
                <div className="bg-stone-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Customer</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || "Guest"}</span></p>
                    {selectedOrder.user?.email && (
                      <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.user.email}</span></p>
                    )}
                    {(selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone) && (
                      <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone}</span></p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-stone-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Shipping Address</h3>
                    <div className="text-sm space-y-0.5 text-gray-700">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
                      <p>{selectedOrder.shippingAddress.addressLine}</p>
                      <p>
                        {[selectedOrder.shippingAddress.area, selectedOrder.shippingAddress.city].filter(Boolean).join(", ")}
                        {selectedOrder.shippingAddress.postalCode && ` – ${selectedOrder.shippingAddress.postalCode}`}
                      </p>
                      {selectedOrder.shippingAddress.country && <p>{selectedOrder.shippingAddress.country}</p>}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Items Ordered</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {selectedOrder.items.map((item, i) => (
                      <div key={item.id} className={`flex items-center gap-3 p-3 ${i !== selectedOrder.items.length - 1 ? "border-b border-gray-100" : ""}`}>
                        {item.product?.thumbnail ? (
                          <img
                            src={getPrimaryThumbnail(item.product.thumbnail) || "/images/placeholder.jpg"}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.productName}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">
                              {`${item.variant.variantName}: ${item.variant.variantValue}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs. {Number(item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-sm text-gray-900 flex-shrink-0">Rs. {Number(item.total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-stone-50 rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-3">Price Breakdown</h3>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs. {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Rs. {Number(selectedOrder.shippingFee).toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount</span>
                      <span>− Rs. {Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-1">
                    <span>Total</span>
                    <span>Rs. {Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-1">Order Notes</h3>
                    <p className="text-sm text-yellow-900">{selectedOrder.notes}</p>
                  </div>
                )}

              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
