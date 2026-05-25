import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Designagartistry",
  robots: {
    index: false,
    follow: false,
  },
};

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Home Content", href: "/dashboard/home-content", icon: "🏠" },
  { name: "Products", href: "/dashboard/products", icon: "📦" },
  { name: "Orders", href: "/dashboard/orders", icon: "🛒" },
  { name: "Users", href: "/dashboard/users", icon: "👥" },
  { name: "Categories", href: "/dashboard/categories", icon: "🏷️" },
  { name: "Reviews", href: "/dashboard/reviews", icon: "⭐" },
  { name: "Coupons", href: "/dashboard/coupons", icon: "🎟️" },
  { name: "Payment Settings", href: "/dashboard/payment-settings", icon: "💳" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      const userData = localStorage.getItem("admin_user");

      if (!token || !userData) {
        router.push("/admin/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        setUser(parsedUser);
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f5f2]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#704204]" />
      </div>
    );
  }

  const sidebarWidth = sidebarOpen ? "md:w-64" : "md:w-16";
  const mainMargin = sidebarOpen ? "md:ml-64" : "md:ml-16";

  return (
    <div className="min-h-screen bg-[#eeede9]">
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-300/80 bg-[#f6f5f2] px-4 py-3 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-stone-800"
          aria-label="Open navigation"
        >
          ☰
        </button>
        <span className="text-sm font-semibold uppercase tracking-wider text-stone-700">Admin</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800"
        >
          Logout
        </button>
      </div>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-stone-300/80 bg-[#f6f5f2] text-stone-800 shadow-sm transition-all duration-300 md:translate-x-0 ${mobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full"} ${sidebarWidth}`}
      >
        <div className={`flex items-center justify-between border-b border-stone-300/60 py-5 ${sidebarOpen ? "px-4" : "justify-center px-0"}`}>
          {sidebarOpen ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                DesigNagArtistry
              </p>
              <h1 className="text-lg font-semibold text-stone-900">Admin</h1>
            </div>
          ) : (
            <span className="text-xl cursor-pointer" title="Admin" onClick={() => setSidebarOpen(true)}>
              ✦
            </span>
          )}
          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-200/80"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              ◀
            </button>
          )}
        </div>

        {user && sidebarOpen && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-stone-300/50 bg-white/60 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#704204] text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-900">{user.name}</p>
              <p className="text-xs text-stone-500">Administrator</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className={`space-y-1 ${sidebarOpen ? "px-3" : "px-2"}`}>
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={!sidebarOpen ? item.name : undefined}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                      sidebarOpen ? "px-3 py-2.5" : "justify-center py-2.5"
                    } ${
                      isActive
                        ? "bg-[#704204] text-white shadow-sm"
                        : "text-stone-700 hover:bg-stone-200/70"
                    }`}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`border-t border-stone-300/60 ${sidebarOpen ? "p-3" : "p-2"}`}>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200/70 ${
              sidebarOpen ? "px-3 py-2.5" : "justify-center py-2.5"
            }`}
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`min-h-screen transition-all duration-300 ${mainMargin}`}>
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
