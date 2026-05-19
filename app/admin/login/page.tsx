"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT ===");
    console.log("Email:", email);
    console.log("Password length:", password?.length);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const raw = await response.text();
      let data: { error?: string; token?: string; user?: unknown };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        throw new Error(
          response.status === 404
            ? "Login API not found (404). Run this app with npm run dev from the project folder, or open the same host/port the API uses."
            : "Server returned a web page instead of JSON. Check the Network tab for POST /api/admin/login (dev server running, no proxy error)."
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.token || data.user === undefined) {
        throw new Error("Invalid login response from server");
      }

      // Store token in localStorage
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      // Set token as cookie for middleware protection
      document.cookie = `admin_token=${data.token}; path=/; max-age=604800`; // 7 days

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f5f2]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your store</p>
        </div>

        {created && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            Admin account created. Sign in with your email and password.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#704204] text-white py-2 px-4 rounded-md hover:bg-[#5a3503] focus:outline-none focus:ring-2 focus:ring-[#704204] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {/* <p className="text-sm text-gray-600">
            No admin yet?{" "}
            <Link href="/admin/setup" className="text-blue-600 hover:text-blue-800">
              Create your first admin account
            </Link>
          </p> */}
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 block">
            Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f6f5f2]">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
