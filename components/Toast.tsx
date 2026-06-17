"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: "success" | "error";
  image?: string;
}

export default function Toast({ message, show, onClose, type = "success", image }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1rem",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "26rem",
        width: "max-content",
        borderRadius: "0.875rem",
        padding: "0.875rem 1.25rem",
        boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
        backgroundColor: type === "success" ? "#111827" : "#dc2626",
        color: "#ffffff",
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.4,
        animation: "toast-in 0.22s ease-out forwards",
        pointerEvents: "auto",
      }}
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "0.5rem",
            objectFit: "cover",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        />
      )}
      {type === "success" ? (
        <svg
          style={{ flexShrink: 0, color: "#4ade80" }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          style={{ flexShrink: 0 }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          marginLeft: "0.25rem",
          opacity: 0.65,
          cursor: "pointer",
          background: "none",
          border: "none",
          color: "inherit",
          padding: 0,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
