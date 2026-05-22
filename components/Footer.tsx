import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="overflow-hidden padding-large">
      <div className="container-fluid">
        <div className="row">
          <div className="row d-flex flex-wrap justify-content-between">
            <div className="col-lg-3 col-sm-6 pb-3 pe-4">
              <div className="footer-menu">
                <img src="/images/MainImage3.png" alt="logo" className="pb-3" />
                <p><strong>Designagartistry</strong> is Pakistan&apos;s premier luxury pret and couture destination, redefining modern ethnic fashion through handcrafted artistry, tonal embroidery, and runway-inspired silhouettes. Explore elevated designer luxury outfits, premium co-ord sets, and festive formals for the woman who embodies timeless sophistication.</p>
              </div>
              <div className="copyright">
                <p>© Copyright 2026. <strong>DesigNagArtistry</strong> by <a target="_blank">Mahnoor Siddiqui</a>
                </p>
              </div>
            </div>
            <div className="col-lg-2 col-sm-6 pb-3">
              <div className="footer-menu text-capitalize">
                <h5 className="widget-title pb-2">Quick Links</h5>
                <ul className="menu-list list-unstyled text-capitalize">
                  <li className="menu-item pb-2">
                    <Link href="/">Home</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/shop">Shop</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/track-order">Track Order</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/contact">Contact</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/return-policy">Return Policy</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/shipping-information">Shipping Info</Link>
                  </li>
                  <li className="menu-item pb-2">
                    <Link href="/terms-conditions">Terms &amp; Conditions</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-2 col-sm-6 pb-3">
              <div className="footer-menu text-capitalize">
                <h5 className="widget-title pb-2">Social</h5>
                <div className="social-links">
                  <ul className="list-unstyled">
                    {/* <li className="pb-2">
                      <a href="#">Facebook</a>
                    </li>
                    <li className="pb-2">
                      <a href="#">Twitter</a>
                    </li>
                    <li className="pb-2">
                      <a href="#">Pinterest</a>
                    </li> */}
                    <li className="pb-2">
                      <a href="https://www.instagram.com/designagartistry.official?igsh=a2lhb2Nva2M0a28=">Instagram</a>
                    </li>
                    {/* <li>
                      <a href="#">Youtube</a>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="footer-menu contact-item">
                <h5 className="widget-title text-capitalize pb-2">Contact Us</h5>
                <p><a href="https://wa.me/923241272547" target="_blank" rel="noopener noreferrer">+ 92 324 1272547</a></p>
                <p><a href="mailto:">info@designagartistry.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
