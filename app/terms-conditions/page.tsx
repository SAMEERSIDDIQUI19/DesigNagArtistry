import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read Designagartistry's Terms & Conditions. By shopping with us you agree to these terms governing purchases, intellectual property, and use of our website.",
  alternates: {
    canonical: "https://www.designagartistry.com/terms-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Designagartistry",
    description: "Terms governing purchases, intellectual property, and use of the Designagartistry website.",
    url: "https://www.designagartistry.com/terms-conditions",
    type: "website",
  },
};

const terms = [
  {
    icon: "🌐",
    title: "1. Acceptance of Terms",
    content: (
      <p className="text-muted mb-0">
        By accessing or using the DesigNagArtistry website and placing an order,
        you confirm that you have read, understood, and agree to be bound by
        these Terms &amp; Conditions. If you do not agree, please do not use our
        website or services. We reserve the right to update these terms at any
        time; continued use of the site constitutes acceptance of any revised
        terms.
      </p>
    ),
  },
  {
    icon: "🛍️",
    title: "2. Products & Orders",
    content: (
      <>
        <p className="text-muted mb-2">
          All products listed on our website are subject to availability.
          Placing an order does not guarantee fulfilment until you receive an
          order confirmation email or message from us.
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>We reserve the right to cancel any order due to pricing errors or stock issues</li>
          <li>Product images are for illustrative purposes; minor colour variations may occur on different screens</li>
          <li>
            Handcrafted items may have natural variations in finish, texture, or
            colour — these are not defects
          </li>
          <li>Prices are listed in <strong>PKR</strong> and are subject to change without notice</li>
        </ul>
      </>
    ),
  },
  {
    icon: "💳",
    title: "3. Payments",
    content: (
      <>
        <p className="text-muted mb-2">
          DesigNagArtistry accepts payments via the methods displayed at
          checkout. All transactions are processed securely.
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>Full payment is required before dispatch for prepaid orders</li>
          <li>Cash on Delivery (COD) is available for eligible areas</li>
          <li>We are not responsible for additional charges imposed by your bank or payment provider</li>
          <li>In case of a failed payment, your order will not be processed until payment is confirmed</li>
        </ul>
      </>
    ),
  },
  {
    icon: "🚚",
    title: "4. Shipping & Delivery",
    content: (
      <>
        <p className="text-muted mb-2">
          Shipping timelines are estimates and not guarantees. Delays caused by
          courier services, customs, or force majeure events are outside our
          control.
        </p>
        <p className="text-muted mb-0">
          For detailed shipping information, including delivery windows, charges,
          and tracking, please visit our{" "}
          <Link href="/shipping-information" className="text-dark fw-medium">
            Shipping Information
          </Link>{" "}
          page.
        </p>
      </>
    ),
  },
  {
    icon: "🔄",
    title: "5. Returns & Exchanges",
    content: (
      <p className="text-muted mb-0">
        Returns and exchanges are governed by our dedicated{" "}
        <Link href="/return-policy" className="text-dark fw-medium">
          Return &amp; Exchange Policy
        </Link>
        . By placing an order, you agree to the conditions outlined in that
        policy. Claims submitted outside the stated windows or conditions will
        not be honoured.
      </p>
    ),
  },
  {
    icon: "🎨",
    title: "6. Intellectual Property",
    content: (
      <>
        <p className="text-muted mb-2">
          All content on this website — including but not limited to product
          images, designs, logos, text, and artwork — is the exclusive
          intellectual property of <strong>DesigNagArtistry</strong> and its
          creators.
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>You may not reproduce, copy, or redistribute any content without written permission</li>
          <li>Our handcrafted and printed designs may not be replicated, resold, or used commercially</li>
          <li>Unauthorised use of our brand name or assets is a violation of applicable intellectual property laws</li>
        </ul>
      </>
    ),
  },
  {
    icon: "🔒",
    title: "7. Privacy & Data",
    content: (
      <p className="text-muted mb-0">
        We collect personal information (name, address, contact details) solely
        for the purpose of processing your orders and improving your shopping
        experience. We do not sell, rent, or share your personal data with third
        parties for marketing purposes. Your data is handled in accordance with
        applicable privacy laws. By using our website, you consent to the
        collection and use of your information as described here.
      </p>
    ),
  },
  {
    icon: "⚠️",
    title: "8. Limitation of Liability",
    content: (
      <>
        <p className="text-muted mb-2">
          DesigNagArtistry shall not be held liable for any indirect, incidental,
          or consequential damages arising from the use of our products or
          website, including but not limited to:
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>Delays or failures in delivery caused by third-party couriers</li>
          <li>Loss or damage during return shipments initiated by the customer</li>
          <li>Allergic reactions or sensitivities to materials — please review product descriptions carefully</li>
          <li>Errors or interruptions in website availability</li>
        </ul>
      </>
    ),
  },
  {
    icon: "🤝",
    title: "9. User Conduct",
    content: (
      <>
        <p className="text-muted mb-2">
          When using our website or contacting our team, you agree not to:
        </p>
        <ul className="text-muted ps-3 mb-0" style={{ lineHeight: "2" }}>
          <li>Submit false, fraudulent, or misleading information</li>
          <li>Attempt to reverse-engineer, scrape, or exploit any part of the website</li>
          <li>Use our platform for any unlawful or unauthorised purpose</li>
          <li>Harass, threaten, or abuse our staff or other customers</li>
        </ul>
      </>
    ),
  },
  {
    icon: "⚖️",
    title: "10. Governing Law",
    content: (
      <p className="text-muted mb-0">
        These Terms &amp; Conditions are governed by and construed in accordance
        with the laws of <strong>Pakistan</strong>. Any disputes arising from
        your use of our website or purchase of our products shall be subject to
        the exclusive jurisdiction of the courts of Pakistan. We encourage all
        disputes to be resolved amicably — please{" "}
        <Link href="/contact" className="text-dark fw-medium">
          contact us
        </Link>{" "}
        first before pursuing any formal action.
      </p>
    ),
  },
];

export default function TermsConditions() {
  return (
    <main aria-labelledby="terms-title">
      {/* ── Hero ── */}
      <div className="bg-light py-5 text-center border-bottom">
        <div className="container-fluid">
          <h1
            id="terms-title"
            className="display-5 text-capitalize fw-bold text-dark mb-2"
          >
            Terms &amp; Conditions
          </h1>
          <p
            className="text-muted mb-0"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            Please read these terms carefully before using the DesigNagArtistry
            website or placing an order with us.
          </p>
          <p className="text-muted small mt-2 mb-0">Last updated: May 2026</p>
        </div>
      </div>

      <div
        className="container-fluid py-5"
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        {/* ── Quick Nav ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 mb-5">
          <h2 className="h6 fw-semibold text-dark mb-3">Quick Navigation</h2>
          <div className="d-flex flex-wrap gap-2">
            {terms.map(({ title }) => {
              const label = title.replace(/^\d+\.\s*/, "");
              const anchor = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
                <a
                  key={title}
                  href={`#${anchor}`}
                  className="badge text-decoration-none fw-normal px-3 py-2"
                  style={{
                    backgroundColor: "#f5efe8",
                    color: "#6b4f2a",
                    border: "1px solid #e8d5b7",
                    borderRadius: "2rem",
                    fontSize: "0.8rem",
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Terms Sections ── */}
        <div className="d-flex flex-column gap-4 mb-5">
          {terms.map(({ icon, title, content }) => {
            const label = title.replace(/^\d+\.\s*/, "");
            const anchor = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <div
                key={title}
                id={anchor}
                className="bg-white rounded-4 shadow-sm border p-4"
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="fs-4">{icon}</span>
                  <h2 className="h5 fw-semibold text-dark mb-0">{title}</h2>
                </div>
                {content}
              </div>
            );
          })}
        </div>

        {/* ── Agreement Note ── */}
        <div
          className="rounded-4 border p-4 mb-5"
          style={{ backgroundColor: "#fdf8f2" }}
        >
          <div className="d-flex align-items-start gap-3">
            <span className="fs-4 flex-shrink-0">📋</span>
            <div>
              <h2 className="h6 fw-semibold text-dark mb-1">
                Your Agreement
              </h2>
              <p className="text-muted small mb-0">
                By completing a purchase on the DesigNagArtistry website, you
                acknowledge that you have read and agreed to these Terms &amp;
                Conditions, our{" "}
                <Link href="/return-policy" className="text-dark fw-medium">
                  Return Policy
                </Link>
                , and our{" "}
                <Link href="/shipping-information" className="text-dark fw-medium">
                  Shipping Information
                </Link>
                . If you have any questions, please contact us before placing
                your order.
              </p>
            </div>
          </div>
        </div>

        {/* ── Contact CTA ── */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 text-center">
          <h2 className="h4 fw-semibold text-dark mb-2">Have a question?</h2>
          <p
            className="text-muted mb-4"
            style={{ maxWidth: 460, margin: "0 auto 1.5rem" }}
          >
            If anything here is unclear or you need clarification before
            purchasing, our team is happy to help.
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
