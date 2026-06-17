"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea =
    pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  const [toast, setToast] = useState<{ show: boolean; message: string; image?: string; type?: "success" | "error" }>({
    show: false,
    message: "",
  });

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const handleShowToast = (event: Event) => {
      const e = event as CustomEvent<{ message: string; image?: string; type?: "success" | "error" }>;
      setToast({ show: true, message: e.detail.message, image: e.detail.image, type: e.detail.type ?? "success" });
    };
    window.addEventListener("showToast", handleShowToast);
    return () => window.removeEventListener("showToast", handleShowToast);
  }, []);

  if (isAdminArea) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <Toast
        show={toast.show}
        message={toast.message}
        image={toast.image}
        type={toast.type}
        onClose={closeToast}
      />
    </>
  );
}
