import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description:
    "Read Designagartistry's return and exchange policy. Easy 7-day returns on eligible items. We stand behind every handcrafted luxury fashion piece we sell.",
  alternates: {
    canonical: "https://www.designagartistry.com/return-policy",
  },
  openGraph: {
    title: "Return & Exchange Policy | Designagartistry",
    description: "Easy 7-day returns on eligible items. Hassle-free exchanges for size or colour.",
    url: "https://www.designagartistry.com/return-policy",
    type: "website",
  },
};

const sections = [
  {
    icon: "📦",
    title: "Return Window",
    content: (
      <>
        <p className="text-muted mb-2">
          You may request a return or exchange within <strong>7 days</strong> of
          receiving your order. Requests submitted after this window cannot be
          processed.
        </p>
        <p className="text-muted mb-0">
          The return window begins on the date your order is marked as{" "}
          <strong>Delivered</strong> in our tracking system.
        </p>
      </>
    ),
  },
  {
    icon: "✅",
    title: "Eligible Items",
    content: (
      <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
        <li>Item received in a damaged or defective condition</li>
        <li>Wrong item delivered (different from what was ordered)</li>
        <li>Item significantly different from the product description</li>
        <li>
          Unused, unworn, and in its original packaging with all tags attached
        </li>
      </ul>
    ),
  },
  {
    icon: "🚫",
    title: "Non-Eligible Items",
    content: (
      <>
        <p className="text-muted mb-2">
          The following items are <strong>not eligible</strong> for return or
          exchange:
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>Items that have been worn, used, or altered</li>
          <li>Items without original packaging or missing tags</li>
          <li>Custom-made, personalised, or made-to-order pieces</li>
          <li>Sale items marked as <strong>Final Sale</strong></li>
          <li>Items returned outside the 7-day window</li>
          <li>Items damaged due to improper handling or care by the customer</li>
        </ul>
      </>
    ),
  },
  {
    icon: "🔄",
    title: "Exchange Policy",
    content: (
      <>
        <p className="text-muted mb-2">
          We happily exchange eligible items for a{" "}
          <strong>different size or colour</strong> of the same product, subject
          to availability.
        </p>
        <p className="text-muted mb-0">
          If the requested exchange item is unavailable, we will issue a{" "}
          <strong>store credit</strong> or a full refund — your choice.
        </p>
      </>
    ),
  },
  {
    icon: "💳",
    title: "Refund Process",
    content: (
      <>
        <p className="text-muted mb-2">
          Once we receive and inspect your returned item, we will notify you of
          the approval status within <strong>2 business days</strong>.
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>
            <strong>Approved refunds</strong> are processed within 5–7 business
            days to your original payment method
          </li>
          <li>
            <strong>Bank transfers / EasyPaisa / JazzCash</strong> refunds may
            take an additional 2–3 days depending on your provider
          </li>
          <li>
            <strong>Cash on Delivery</strong> orders are refunded via bank
            transfer — please provide your account details when contacting us
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: "🚚",
    title: "Return Shipping",
    content: (
      <>
        <p className="text-muted mb-2">
          Return shipping costs are the <strong>customer's responsibility</strong>{" "}
          unless the return is due to our error (wrong item, defective product).
        </p>
        <p className="text-muted mb-0">
          We recommend using a trackable courier service. DesigNagArtistry is
          not liable for items lost in transit during the return shipment.
        </p>
      </>
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Contact Us First",
    description:
      "Email us at info@designagartistry.com or WhatsApp +92 324 1272547 with your order number and reason for return. Do not ship the item without prior approval.",
  },
  {
    step: "02",
    title: "Receive Approval",
    description:
      "Our team will review your request and respond within 1–2 business days with approval and return shipping instructions.",
  },
  {
    step: "03",
    title: "Ship the Item",
    description:
      "Pack the item securely in its original packaging and ship it to the address provided. Share the tracking number with us once dispatched.",
  },
  {
    step: "04",
    title: "Refund or Exchange",
    description:
      "Once we receive and inspect the item, your refund or exchange will be processed within 5–7 business days.",
  },
];

export default function ReturnPolicy() {
  return (
    <main aria-labelledby="return-policy-title">
      {/* ── Hero ── */}
      <div className="bg-light py-5 text-center border-bottom">
        <div className="container-fluid">
          <h1
            id="return-policy-title"
            className="display-5 text-capitalize fw-bold text-dark mb-2"
          >
            Return &amp; Exchange Policy
          </h1>
          <p
            className="text-muted mb-0"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            We stand behind every piece we craft. If something isn&apos;t right,
            we will make it right — quickly and without hassle.
          </p>
          <p className="text-muted small mt-2 mb-0">
            Last updated: May 2026
          </p>
        </div>
      </div>

      <div
        className="container-fluid py-5"
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        {/* ── Policy Sections Grid ── */}
        <div className="row g-4 mb-5">
          {sections.map(({ icon, title, content }) => (
            <div className="col-lg-6" key={title}>
              <div className="bg-white rounded-4 shadow-sm border p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="fs-4">{icon}</span>
                  <h2 className="h5 fw-semibold text-dark mb-0">{title}</h2>
                </div>
                {content}
              </div>
            </div>
          ))}
        </div>

        {/* ── How to Return: Step-by-Step ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
          <h2 className="h4 fw-semibold text-dark mb-1">
            How to Request a Return
          </h2>
          <p className="text-muted small mb-4">
            Follow these four steps — the whole process is straightforward.
          </p>
          <div className="row g-4">
            {steps.map(({ step, title, description }) => (
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
                  <p className="text-muted small mb-0">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Important Note ── */}
        <div
          className="rounded-4 border p-4 mb-5"
          style={{ backgroundColor: "#fdf8f2", borderColor: "#e8d5b7 !important" }}
        >
          <div className="d-flex align-items-start gap-3">
            <span className="fs-4 flex-shrink-0">⚠️</span>
            <div>
              <h2 className="h6 fw-semibold text-dark mb-1">
                Important — Handcrafted &amp; Artisan Items
              </h2>
              <p className="text-muted small mb-0">
                Because our pieces are <strong>handcrafted or printed individually</strong>,
                minor natural variations in texture, colour, or finish are not
                considered defects — they are part of what makes each piece
                unique. Returns based solely on these natural characteristics
                will not be approved. Please read product descriptions carefully
                before ordering, and{" "}
                <Link href="/contact" className="text-dark fw-medium">
                  reach out to us
                </Link>{" "}
                if you have questions about a specific item before purchasing.
              </p>
            </div>
          </div>
        </div>

        {/* ── Contact CTA ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center">
          <h2 className="h4 fw-semibold text-dark mb-2">
            Still have questions?
          </h2>
          <p
            className="text-muted mb-4"
            style={{ maxWidth: 480, margin: "0 auto 1.5rem" }}
          >
            Our team is available Monday – Saturday to help with any questions
            about your order, a return, or an exchange.
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
