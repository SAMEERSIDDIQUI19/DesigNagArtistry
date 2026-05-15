import Link from 'next/link';

export default function Contact() {
  return (
    <main aria-labelledby="title" className="padding-large">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="display-header text-center">
              <h2 id="title" className="display-2 text-capitalize text-dark pb-2">Contact Us</h2>
              <p className="pb-3">
                Get in touch with us for any questions or inquiries.
              </p>
            </div>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-md-6 offset-md-3">
            <div className="card border-0">
              <div className="card-body">
                <address className="text-center">
                  <h4 className="text-capitalize mb-4">Contact Information</h4>
                  <p className="mb-3">
                    <strong>Address:</strong><br />
                    Tea Berry, Marinette, USA
                  </p>
                  <p className="mb-3">
                    <strong>Phone:</strong><br />
                    <Link href="tel:+120345678910">+ 12(0) 34 56 78 910</Link>
                  </p>
                  <p className="mb-3">
                    <strong>Email:</strong><br />
                    <Link href="mailto:info@yourmail.com">info@yourmail.com</Link>
                  </p>
                </address>
                <div className="text-center mt-4">
                  <Link href="/" className="btn btn-medium btn-arrow outline-dark position-relative">
                    <span className="text-capitalize">Back to Home</span>
                    <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
