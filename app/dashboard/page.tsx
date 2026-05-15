"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, icon: "📦", color: "bg-blue-500" },
    { title: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "bg-green-500" },
    { title: "Total Users", value: stats.totalUsers, icon: "👥", color: "bg-purple-500" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "bg-yellow-500" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "bg-orange-500" },
    { title: "Low Stock Products", value: stats.lowStockProducts, icon: "⚠️", color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-16 h-16 ${card.color} rounded-full flex items-center justify-center text-3xl`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboard/products/new"
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">➕</div>
                <div className="font-semibold">Add New Product</div>
              </a>
              <a
                href="/dashboard/orders"
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-semibold">View Orders</div>
              </a>
              <a
                href="/dashboard/users"
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="font-semibold">Manage Users</div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
