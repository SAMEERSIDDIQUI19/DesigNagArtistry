import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Information | DesigNagArtistry",
  description:
    "Learn about DesigNagArtistry's shipping policy — delivery timelines, charges, tracking, and coverage areas across Pakistan and internationally.",
};

const shippingZones = [
  {
    zone: "Major Cities",
    cities: "Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad",
    standard: "2–4 business days",
    express: "1–2 business days",
    charge: "Rs. 150 – 200",
  },
  {
    zone: "Other Cities",
    cities: "Multan, Peshawar, Quetta, Sialkot, Gujranwala, and more",
    standard: "3–6 business days",
    express: "2–3 business days",
    charge: "Rs. 200 – 300",
  },
  {
    zone: "Remote Areas",
    cities: "Rural towns, FATA regions, AJK, Gilgit-Baltistan",
    standard: "5–8 business days",
    express: "Not available",
    charge: "Rs. 300 – 400",
  },
];

const faqs = [
  {
    q: "When will my order be dispatched?",
    a: "Orders are processed and dispatched within 1–2 business days after payment confirmation. During sale periods or high-demand seasons, dispatch may take up to 3 business days.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order is dispatched, you will receive a tracking number via email or WhatsApp. You can use this number on our Track Order page or directly on the courier's website.",
  },
  {
    q: "What if my order is delayed?",
    a: "Courier delays, weather events, or public holidays can occasionally affect delivery timelines. If your order is significantly overdue, please contact us and we will follow up with the courier on your behalf.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes — orders above a minimum value qualify for free standard shipping within Pakistan. The current free shipping threshold is displayed at checkout.",
  },
  {
    q: "What happens if my package is lost in transit?",
    a: "If your package is confirmed lost by the courier, we will either resend your order or issue a full refund — your choice. Please report lost packages within 10 days of the expected delivery date.",
  },
  {
    q: "Do you ship internationally?",
    a: "We are currently focused on delivering across Pakistan. International shipping is available on request for select destinations — contact us via WhatsApp or email to discuss rates and timelines.",
  },
  {
    q: "Can I change my delivery address after placing an order?",
    a: "Address changes are possible only before the order is dispatched. Contact us immediately via WhatsApp (+92 324 1272547) if you need to update your address.",
  },
  {
    q: "What couriers do you use?",
    a: "We work with trusted Pakistani courier services including TCS, Leopards, and M&P depending on your location and the delivery type selected.",
  },
];

export default function ShippingInformation() {
  return (
    <main aria-labelledby="shipping-title">
      {/* ── Hero ── */}
      <div className="bg-light py-5 text-center border-bottom">
        <div className="container-fluid">
          <h1
            id="shipping-title"
            className="display-5 text-capitalize fw-bold text-dark mb-2"
          >
            Shipping Information
          </h1>
          <p
            className="text-muted mb-0"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            Everything you need to know about how we get your DesigNagArtistry
            order safely to your door.
          </p>
          <p className="text-muted small mt-2 mb-0">Last updated: May 2026</p>
        </div>
      </div>

      <div
        className="container-fluid py-5"
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        {/* ── Key Highlights ── */}
        <div className="row g-4 mb-5">
          {[
            { icon: "⚡", label: "Processing Time", value: "1–2 Business Days" },
            { icon: "📦", label: "Packaging", value: "Secure & Branded" },
            { icon: "🔍", label: "Order Tracking", value: "Real-Time Updates" },
            { icon: "🎁", label: "Free Shipping", value: "On Qualifying Orders" },
          ].map(({ icon, label, value }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className="bg-white rounded-4 shadow-sm border p-4 text-center h-100">
                <div className="fs-2 mb-2">{icon}</div>
                <p className="small text-muted mb-1">{label}</p>
                <p className="fw-semibold text-dark mb-0">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Delivery Zones Table ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="fs-4">🗺️</span>
            <h2 className="h4 fw-semibold text-dark mb-0">
              Delivery Zones &amp; Timelines
            </h2>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0" style={{ fontSize: "0.9rem" }}>
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold text-dark">Zone</th>
                  <th className="fw-semibold text-dark">Coverage</th>
                  <th className="fw-semibold text-dark">Standard Delivery</th>
                  <th className="fw-semibold text-dark">Express Delivery</th>
                  <th className="fw-semibold text-dark">Estimated Charge</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map(({ zone, cities, standard, express, charge }) => (
                  <tr key={zone}>
                    <td className="fw-medium text-dark">{zone}</td>
                    <td className="text-muted">{cities}</td>
                    <td className="text-muted">{standard}</td>
                    <td className="text-muted">{express}</td>
                    <td className="text-muted">{charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-3 mb-0">
            * All delivery timelines are estimates from the date of dispatch, not
            the date of order. Public holidays and courier delays may extend
            these windows.
          </p>
        </div>

        {/* ── How It Works ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="fs-4">📋</span>
            <h2 className="h4 fw-semibold text-dark mb-0">
              How Your Order Gets to You
            </h2>
          </div>
          <div className="row g-4">
            {[
              {
                step: "01",
                title: "Order Confirmed",
                desc: "You place your order and receive a confirmation. Payment is verified within a few hours.",
              },
              {
                step: "02",
                title: "Carefully Packed",
                desc: "Your item is individually wrapped and packed in branded packaging to ensure it arrives in perfect condition.",
              },
              {
                step: "03",
                title: "Handed to Courier",
                desc: "Your parcel is handed to our courier partner within 1–2 business days. You receive a tracking number.",
              },
              {
                step: "04",
                title: "Delivered to You",
                desc: "Your order arrives at your door. Open, unbox, and wear your new favourite piece.",
              },
            ].map(({ step, title, desc }) => (
              <div className="col-sm-6 col-lg-3" key={step}>
                <div className="d-flex flex-column h-100">
                  <div
                    className="fw-bold mb-2"
                    style={{
                      fontSize: "2rem",
                      lineHeight: 1,
                      color: "#c9a96e",
                      fontFamily: "var(--heading-font, serif)",
                    }}
                  >
                    {step}
                  </div>
                  <h3 className="h6 fw-semibold text-dark mb-2">{title}</h3>
                  <p className="text-muted small mb-0">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Track Order CTA ── */}
        <div
          className="rounded-4 border p-4 mb-5 d-flex flex-wrap align-items-center justify-content-between gap-3"
          style={{ backgroundColor: "#fdf8f2" }}
        >
          <div className="d-flex align-items-start gap-3">
            <span className="fs-3 flex-shrink-0">📍</span>
            <div>
              <h2 className="h6 fw-semibold text-dark mb-1">
                Track Your Order
              </h2>
              <p className="text-muted small mb-0">
                Have your order number ready and check real-time delivery status
                on our tracking page.
              </p>
            </div>
          </div>
          <Link
            href="/track-order"
            className="btn btn-medium btn-arrow outline-dark position-relative flex-shrink-0"
          >
            <span className="text-capitalize">Track My Order</span>
            <svg
              className="arrow-right position-absolute"
              width="18"
              height="20"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
            </svg>
          </Link>
        </div>

        {/* ── FAQ ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="fs-4">❓</span>
            <h2 className="h4 fw-semibold text-dark mb-0">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="d-flex flex-column gap-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-bottom pb-4">
                <p className="fw-semibold text-dark mb-1">{q}</p>
                <p className="text-muted small mb-0">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Related Policies ── */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="bg-white rounded-4 shadow-sm border p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="fs-3 mb-2">🔄</div>
                <h2 className="h5 fw-semibold text-dark mb-2">Return Policy</h2>
                <p className="text-muted small mb-3">
                  Need to return or exchange an item? Read our 7-day return
                  policy for full eligibility details and step-by-step
                  instructions.
                </p>
              </div>
              <Link
                href="/return-policy"
                className="btn btn-medium btn-arrow outline-dark position-relative align-self-start"
              >
                <span className="text-capitalize">View Return Policy</span>
                <svg
                  className="arrow-right position-absolute"
                  width="18"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 shadow-sm border p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="fs-3 mb-2">📄</div>
                <h2 className="h5 fw-semibold text-dark mb-2">
                  Terms &amp; Conditions
                </h2>
                <p className="text-muted small mb-3">
                  Review the full terms governing your use of the DesigNagArtistry
                  website, your purchases, and your rights as a customer.
                </p>
              </div>
              <Link
                href="/terms-conditions"
                className="btn btn-medium btn-arrow outline-dark position-relative align-self-start"
              >
                <span className="text-capitalize">View Terms</span>
                <svg
                  className="arrow-right position-absolute"
                  width="18"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Contact CTA ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center">
          <h2 className="h4 fw-semibold text-dark mb-2">
            Need help with your shipment?
          </h2>
          <p
            className="text-muted mb-4"
            style={{ maxWidth: 460, margin: "0 auto 1.5rem" }}
          >
            Reach out via WhatsApp or our contact form — our team responds
            within a few hours on business days.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a
              href="https://wa.me/923241272547"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-medium btn-arrow outline-dark position-relative"
            >
              <span className="text-capitalize">WhatsApp Us</span>
              <svg
                className="arrow-right position-absolute"
                width="18"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
              </svg>
            </a>
            <Link
              href="/contact"
              className="btn btn-medium btn-arrow position-relative"
            >
              <span className="text-capitalize">Contact Page</span>
              <svg
                className="arrow-right position-absolute"
                width="18"
                height="20"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
