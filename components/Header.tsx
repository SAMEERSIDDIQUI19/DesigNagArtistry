'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [searchActive, setSearchActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Generate or get session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/cart", {
        headers: {
          "x-session-id": sessionId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const count = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const e = event as CustomEvent<{ delta?: number; count?: number }>;
      if (e.detail?.count !== undefined) {
        setCartCount(e.detail.count);
      } else if (e.detail?.delta !== undefined) {
        setCartCount((prev) => Math.max(0, prev + e.detail.delta!));
      } else {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdate', handleCartUpdate);
    return () => window.removeEventListener('cartUpdate', handleCartUpdate);
  }, []);

  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  }, []);

  // Close mobile menu when a link is clicked
  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Preloader */}
      <div id="preloader">
        <span className="loader"></span>
      </div>

      {/* Search Box */}
      <div className={`search-box position-relative overflow-hidden w-100 ${searchActive ? 'active' : ''}`}>
        <div className="search-wrap">
          <div className="close-button position-absolute" onClick={() => setSearchActive(false)}>
            <svg className="close" width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
            </svg>
          </div>
          <form className="text-center pt-3">
            <input 
              type="text" 
              className="search-input fs-5 p-4 bg-transparent" 
              placeholder="Search..."
            />
            <svg className="search" width="22" height="22" viewBox="0 0 32 32" fill="currentColor">
              <path d="M19 3C13.488 3 9 7.488 9 13c0 2.395.84 4.59 2.25 6.313L3.281 27.28l1.439 1.44l7.968-7.969A9.922 9.922 0 0 0 19 23c5.512 0 10-4.488 10-10S24.512 3 19 3zm0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8s-8-3.57-8-8s3.57-8 8-8z" />
            </svg>
          </form>
        </div>
      </div>

      {/* Header */}
      <header id="header" className="site-header text-black">
        <nav id="header-nav" className="navbar navbar-expand-lg px-3">
          <div className="container-fluid">
            {/* Logo */}
            <Link className="navbar-brand" href="/">
              <img src="/images/MainImage3.png" className="logo" alt="DesigNagArtistry" />
            </Link>
            
            {/* Mobile Menu Toggle Button - Hidden on desktop (lg and above) */}
            <button 
              className="navbar-toggler d-lg-none order-3 p-2" 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobileMenu"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
            >
              <svg className="navbar-icon" width="50" height="50" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 10.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0 0 1h11a.5.5 0 0 0 .5-.5z" />
              </svg>
            </button>

            {/* Mobile Menu - Hidden on desktop (lg and above) */}
            <div 
              id="mobileMenu"
              className={`offcanvas offcanvas-end d-lg-none ${mobileMenuOpen ? 'show' : ''}`}
              style={{ visibility: mobileMenuOpen ? 'visible' : 'hidden' }}
            >
              <div className="offcanvas-header px-4 pb-0">
                <Link className="navbar-brand" href="/">
                  <img src="/images/MainImage3.png" className="logo" alt="DesigNagArtistry" />
                </Link>
                <button 
                  type="button" 
                  className="btn-close btn-close-black" 
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                />
              </div>
              <div className="offcanvas-body">
                <ul className="navbar-nav text-capitalize justify-content-end align-items-center flex-grow-1 pe-3">
                  <li className="nav-item">
                    <Link 
                      className="nav-link me-4 active" 
                      href="/" 
                      onClick={handleNavLinkClick}
                    >
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      className="nav-link me-4" 
                      href="/about" 
                      onClick={handleNavLinkClick}
                    >
                      About Us
                    </Link>
                  </li>
                  <li className="nav-item dropdown me-4">
                    <Link 
                      className="nav-link dropdown-toggle" 
                      href="/shop" 
                      onClick={handleNavLinkClick}
                    >
                      Shop
                    </Link>
                  </li>
                  <li className="nav-item me-4">
                    <Link 
                      className="nav-link" 
                      href="/track-order" 
                      onClick={handleNavLinkClick}
                    >
                      Track Order
                    </Link>
                  </li>
                  {/* <li className="nav-item dropdown me-4">
                    <Link 
                      className="nav-link dropdown-toggle" 
                      href="/blog" 
                      onClick={handleNavLinkClick}
                    >
                      Blog
                    </Link>
                  </li> */}
                  {/* <li className="nav-item dropdown me-4">
                    <Link 
                      className="nav-link dropdown-toggle" 
                      href="/pages" 
                      onClick={handleNavLinkClick}
                    >
                      Pages
                    </Link>
                  </li> */}
                  <li className="nav-item">
                    <div className="user-items ps-5">
                      <ul className="d-flex justify-content-end list-unstyled">
                        <li className="search-item pe-3" onClick={() => { setSearchActive(true); setMobileMenuOpen(false); }}>
                          <svg className="search" width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                            <path d="M19 3C13.488 3 9 7.488 9 13c0 2.395.84 4.59 2.25 6.313L3.281 27.28l1.439 1.44l7.968-7.969A9.922 9.922 0 0 0 19 23c5.512 0 10-4.488 10-10S24.512 3 19 3zm0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8s-8-3.57-8-8s3.57-8 8-8z" />
                          </svg>
                          <span className="sr-only">Search</span>
                        </li>
                        <li className="pe-3">
                          <Link href="#" onClick={handleNavLinkClick}>
                            <svg className="user" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            </svg>
                            <span className="sr-only">User Account</span>
                          </Link>
                        </li>
                        <li className="position-relative">
                          <Link href="/cart" onClick={handleNavLinkClick}>
                            <svg className="cart" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </svg>
                            <span className="sr-only">Shopping Cart</span>
                            {cartCount > 0 && (
                              <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {cartCount}
                                <span className="visually-hidden">items in cart</span>
                              </span>
                            )}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Desktop Menu - Hidden on mobile (below lg) */}
            <ul className="navbar-nav text-capitalize justify-content-end align-items-center flex-grow-1 pe-3 d-none d-lg-flex">
              <li className="nav-item">
                <Link className="nav-link me-4 active" href="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link me-4" href="/about">
                  About Us
                </Link>
              </li>
              <li className="nav-item dropdown me-4">
                <Link className="nav-link dropdown-toggle" href="/shop">
                  Shop
                </Link>
              </li>
              <li className="nav-item me-4">
                <Link className="nav-link" href="/track-order">
                  Track Order
                </Link>
              </li>
              {/* <li className="nav-item dropdown me-4">
                <Link className="nav-link dropdown-toggle" href="/blog">
                  Blog
                </Link>
              </li>
              <li className="nav-item dropdown me-4">
                <Link className="nav-link dropdown-toggle" href="/pages">
                  Pages
                </Link>
              </li> */}
              <li className="nav-item">
                <div className="user-items ps-5">
                  <ul className="d-flex justify-content-end list-unstyled">
                    <li className="search-item pe-3" onClick={() => setSearchActive(true)}>
                      <svg className="search" width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M19 3C13.488 3 9 7.488 9 13c0 2.395.84 4.59 2.25 6.313L3.281 27.28l1.439 1.44l7.968-7.969A9.922 9.922 0 0 0 19 23c5.512 0 10-4.488 10-10S24.512 3 19 3zm0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8s-8-3.57-8-8s3.57-8 8-8z" />
                      </svg>
                      <span className="sr-only">Search</span>
                    </li>
                    <li className="pe-3">
                      <Link href="#">
                        <svg className="user" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                        <span className="sr-only">User Account</span>
                      </Link>
                    </li>
                    <li className="position-relative">
                      <Link href="/cart">
                        <svg className="cart" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                        </svg>
                        <span className="sr-only">Shopping Cart</span>
                        {cartCount > 0 && (
                          <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {cartCount}
                            <span className="visually-hidden">items in cart</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}