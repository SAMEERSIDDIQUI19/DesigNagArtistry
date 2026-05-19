"use client";

import Link from "next/link";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <main aria-labelledby="contact-title">
      {/* Hero */}
      <div className="bg-light py-5 text-center border-bottom">
        <div className="container-fluid">
          <h1 id="contact-title" className="display-5 text-capitalize fw-bold text-dark mb-2">
            Contact Us
          </h1>
          <p className="text-muted mb-0" style={{ maxWidth: 520, margin: "0 auto" }}>
            Have a question about an order, a product, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="container-fluid py-5">
        <div className="row g-5 justify-content-center" style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Contact Form ── */}
          <div className="col-lg-7">
            <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5">
              <h2 className="h4 fw-semibold text-dark mb-1">Send us a message</h2>
              <p className="text-muted small mb-4">We typically reply within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-5">
                  <div className="display-3 mb-3">✅</div>
                  <h3 className="h5 fw-semibold text-dark mb-2">Message sent!</h3>
                  <p className="text-muted mb-4">Thank you, <strong>{form.name}</strong>. We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                    className="btn btn-medium btn-arrow position-relative"
                  >
                    <span className="text-capitalize">Send another</span>
                    <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-medium text-dark">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Ayesha Khan"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-medium text-dark">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium text-dark">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+92 300 0000000"
                        className="form-control"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium text-dark">
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Write your message here…"
                        rows={5}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-danger small mt-3 mb-0">{error}</p>
                  )}

                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-medium btn-arrow position-relative"
                    >
                      <span className="text-capitalize">
                        {submitting ? "Sending…" : "Send Message"}
                      </span>
                      <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── Contact Info ── */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4">

              <div className="bg-white rounded-4 shadow-sm border p-4">
                <h2 className="h5 fw-semibold text-dark mb-3">Get in touch</h2>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <span className="fs-4 flex-shrink-0">📞</span>
                    <div>
                      <p className="small fw-semibold text-dark mb-0">Phone / WhatsApp</p>
                      <a href="https://wa.me/923241272547" target="_blank" rel="noopener noreferrer" className="small text-muted text-decoration-none">
                        + 92 324 1272547
                      </a>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <span className="fs-4 flex-shrink-0">✉️</span>
                    <div>
                      <p className="small fw-semibold text-dark mb-0">Email</p>
                      <a href="mailto:info@designagartistry.com" className="small text-muted text-decoration-none">
                        info@designagartistry.com
                      </a>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <span className="fs-4 flex-shrink-0">📸</span>
                    <div>
                      <p className="small fw-semibold text-dark mb-0">Instagram</p>
                      <a
                        href="https://www.instagram.com/designagartistry.official?igsh=a2lhb2Nva2M0a28="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small text-muted text-decoration-none"
                      >
                        @designagartistry.official
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-4 shadow-sm border p-4">
                <h2 className="h5 fw-semibold text-dark mb-2">Business Hours</h2>
                <div className="d-flex flex-column gap-1">
                  {[
                    { day: "Mon – Fri", hours: "10:00 AM – 7:00 PM" },
                    { day: "Saturday", hours: "11:00 AM – 5:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map(({ day, hours }) => (
                    <div key={day} className="d-flex justify-content-between small">
                      <span className="text-dark fw-medium">{day}</span>
                      <span className="text-muted">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link href="/shop" className="btn btn-medium btn-arrow outline-dark position-relative w-100">
                  <span className="text-capitalize">Browse Our Shop</span>
                  <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                  </svg>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
