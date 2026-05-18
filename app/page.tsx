'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';

interface HomeContent {
  billboard: {
    slides: {
      image: string;
      title: string;
      titleColor?: string;
      description: string;
      buttonText: string;
      buttonLink: string;
      buttonOutlineColor?: string;
    }[];
  };
  banner: {
    items: {
      image: string;
      title: string;
      titleColor?: string;
      buttonText: string;
      buttonLink: string;
      buttonOutlineColor?: string;
    }[];
  };
  aboutUs: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  featuredProducts: {
    title: string;
    buttonText: string;
    buttonLink: string;
    products: {
      image: string;
      name: string;
      price: string;
      slug: string;
    }[];
  };
  testimonials: {
    items: {
      quote: string;
      author: string;
    }[];
  };
  trendingProducts: {
    title: string;
    buttonText: string;
    buttonLink: string;
    products: {
      image: string;
      name: string;
      price: string;
      slug: string;
    }[];
  };
  latestBlog: {
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

export default function Home() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const mainSwiperRef = useRef<Swiper | null>(null);
  const featuredSwiperRef = useRef<Swiper | null>(null);
  const trendingSwiperRef = useRef<Swiper | null>(null);
  const testimonialSwiperRef = useRef<Swiper | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/home-content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!content) return;

    // Initialize Main Swiper
    if (typeof window !== 'undefined') {
      mainSwiperRef.current = new Swiper('.main-swiper', {
        speed: 500,
        loop: true,
        pagination: {
          el: '#billboard .swiper-pagination',
          clickable: true,
        },
      });

      featuredSwiperRef.current = new Swiper('#featured-swiper .swiper', {
        slidesPerView: 4,
        spaceBetween: 20,
        pagination: {
          el: '#featured-swiper .swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          0: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 10 },
          999: { slidesPerView: 3, spaceBetween: 10 },
          1366: { slidesPerView: 4, spaceBetween: 40 },
        },
      });

      trendingSwiperRef.current = new Swiper('#trending-swiper .swiper', {
        slidesPerView: 4,
        spaceBetween: 20,
        pagination: {
          el: '#trending-swiper .swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          0: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 10 },
          999: { slidesPerView: 3, spaceBetween: 10 },
          1366: { slidesPerView: 4, spaceBetween: 40 },
        },
      });

      testimonialSwiperRef.current = new Swiper('.testimonial-swiper', {
        loop: true,
        navigation: {
          nextEl: '.swiper-arrow-next',
          prevEl: '.swiper-arrow-prev',
        },
        pagination: {
          el: '#testimonials .swiper-pagination',
          clickable: true,
        },
      });
    }

    return () => {
      mainSwiperRef.current?.destroy();
      featuredSwiperRef.current?.destroy();
      trendingSwiperRef.current?.destroy();
      testimonialSwiperRef.current?.destroy();
    };
  }, [content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#704204]" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load home content</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Billboard Section */}
      <section id="billboard" className="overflow-hidden">
        <div className="swiper main-swiper">
          <div className="swiper-wrapper">
            {content.billboard.slides.map((slide, index) => (
              <div className="swiper-slide" key={index}>
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="banner-item banner-item-responsive align-content-center"
                        style={{ backgroundImage: `url(${slide.image})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: 'contain' }}>
                        <div className="banner-content padding-large">
                          <h2 className="display-2 text-capitalize pb-2" style={slide.titleColor ? { color: slide.titleColor } : {}}>{slide.title}</h2>
                          <p>
                            {slide.description}
                          </p>
                          <Link href={slide.buttonLink} className="btn btn-medium btn-arrow position-relative mt-3" style={slide.buttonOutlineColor ? { borderColor: slide.buttonOutlineColor, color: slide.buttonOutlineColor } : {}}>
                            <span className="text-capitalize">{slide.buttonText}</span>
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
            ))}
          </div>
        </div>
        <div className="swiper-pagination position-absolute"></div>
      </section>

      {/* Banner Section */}
      <section id="banner" className="padding-large">
        <div className="container-fluid">
          <div className="row">
            {content.banner.items.map((item, index) => (
              <div key={index} className="col-md-4 banner-content-1 position-relative">
                <div>
                  <img src={item.image} className="img-fluid" alt="img" />
                </div>
                <div className="banner-content-text position-absolute">
                  <h2 className="display-5" style={item.titleColor ? { color: item.titleColor } : {}}>{item.title}</h2>
                  <Link href={item.buttonLink} className="btn btn-medium btn-arrow outline-dark position-relative mt-3" style={item.buttonOutlineColor ? { borderColor: item.buttonOutlineColor, color: item.buttonOutlineColor } : {}}>
                    <span className="text-capitalize fs-6">{item.buttonText}</span>
                    <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="padding-large pt-0">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between g-5">
            <div className="col-md-6 offset-md-3">
              <div className="detail">
                <div className="display-header text-center">
                  <h2 className="display-2 text-capitalize text-dark pb-2">{content.aboutUs.title}</h2>
                  <p className="pb-3">
                    {content.aboutUs.description}
                  </p>
                  <Link href={content.aboutUs.buttonLink} className="btn btn-medium btn-arrow outline-dark position-relative mt-3">
                    <span className="text-capitalize">{content.aboutUs.buttonText}</span>
                    <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="product-store position-relative">
        <div className="container-fluid">
          <div className="row">
            <div className="display-header pb-3 d-flex justify-content-between flex-wrap col-md-12">
              <h2 className="display-2 text-dark text-capitalize">{content.featuredProducts.title}</h2>
              <Link href={content.featuredProducts.buttonLink} className="btn btn-medium btn-arrow btn-normal position-relative">
                <span className="text-capitalize">{content.featuredProducts.buttonText}</span>
                <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="row">
            <div id="featured-swiper" className="product-swiper col-md-12">
              <div className="swiper">
                <div className="swiper-wrapper">
                  {content.featuredProducts.products.map((product, index) => (
                    <div className="swiper-slide" key={index}>
                      <div className="product-card image-zoom-effect link-effect d-flex flex-wrap">
                        <div className="gold-frame-wrapper">
                          <div className="gold-frame gold-frame-1"></div>
                          <div className="gold-frame gold-frame-2"></div>
                          <img src={product.image} alt={product.name} className="product-image img-fluid" />
                        </div>
                        <div className="cart-concern">
                          <h3 className="card-title text-capitalize pt-3 text-primary">
                            <Link href={`/product/${product.slug}`} className="text-primary">{product.name}</Link>
                          </h3>
                          <div className="cart-info">
                            <a className="pseudo-text-effect" href="#" data-after="ADD TO CART"><span>{product.price}</span></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="swiper-pagination text-center mt-5"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="position-relative padding-large">
        <div className="container">
          <div className="row">
            <div className="review-content position-relative">
              <div className="swiper-icon swiper-arrow swiper-arrow-prev position-absolute d-flex align-items-center justify-content-center">
                <svg className="icon-arrow" width="25" height="25" viewBox="0 0 32 32" fill="currentColor">
                  <path d="m13.281 6.781l-8.5 8.5l-.687.719l.687.719l8.5 8.5l1.438-1.438L7.938 17H28v-2H7.937l6.782-6.781z" />
                </svg>
              </div>
              <div className="swiper testimonial-swiper">
                <div className="quotation text-center">
                  <svg className="quote" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m15 17l2-4h-4V6h7v7l-2 4h-3Zm-9 0l2-4H4V6h7v7l-2 4H6Z" />
                  </svg>
                </div>
                <div className="swiper-wrapper">
                  {content.testimonials.items.map((testimonial, index) => (
                    <div className="swiper-slide text-center d-flex justify-content-center" key={index}>
                      <div className="review-item col-md-10">
                        <i className="icon icon-review"></i>
                        <blockquote className="fs-4">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="author-detail">
                          <div className="name text-primary text-capitalize pt-2">{testimonial.author}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="swiper-icon swiper-arrow swiper-arrow-next position-absolute d-flex align-items-center justify-content-center">
                <svg className="icon-arrow" width="25" height="25" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="swiper-pagination text-center position-absolute"></div>
      </section>

      {/* Trending Products Section */}
      <section id="trending-products" className="product-store">
        <div className="container-fluid">
          <div className="row overflow-hidden">
            <div className="display-header pb-3 d-flex justify-content-between col-md-12">
              <h2 className="display-2 text-dark text-capitalize">{content.trendingProducts.title}</h2>
              <Link href={content.trendingProducts.buttonLink} className="btn btn-medium btn-arrow btn-normal position-relative">
                <span className="text-capitalize">{content.trendingProducts.buttonText}</span>
                <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
            <div id="trending-swiper" className="product-swiper col-md-12">
              <div className="swiper">
                <div className="swiper-wrapper">
                  {content.trendingProducts.products.map((product, index) => (
                    <div className="swiper-slide" key={index}>
                      <div className="product-card image-zoom-effect link-effect d-flex flex-wrap">
                        <div className="gold-frame-wrapper">
                          <div className="gold-frame gold-frame-1"></div>
                          <div className="gold-frame gold-frame-2"></div>
                          <img src={product.image} alt={product.name} className="product-image img-fluid" />
                        </div>
                        <div className="cart-concern">
                          <h3 className="card-title text-capitalize pt-3 text-primary">
                            <Link href={`/product/${product.slug}`} className="text-primary">{product.name}</Link>
                          </h3>
                          <div className="cart-info">
                            <a className="pseudo-text-effect" href="#" data-after="ADD TO CART"><span>{product.price}</span></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="swiper-pagination text-center mt-5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Section */}
      <section id="latest-blog" className="padding-large">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="display-header d-flex flex-wrap justify-content-between pb-3">
                <h2 className="display-2 text-dark text-capitalize">{content.latestBlog.title}</h2>
                <Link href={content.latestBlog.buttonLink} className="btn btn-medium btn-arrow btn-normal position-relative">
                  <span className="text-capitalize">{content.latestBlog.buttonText}</span>
                  <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="row g-3 post-grid">
            {[1, 2, 3].map((item) => (
              <div className="col-lg-4 col-md-6 col-sm-12 mb-5" key={item}>
                <div className="card-item">
                  <div className="card border-0 bg-transparent">
                    <div className="card-image">
                      <img src={`/images/post-item${item}.jpg`} alt="image" className="post-image img-fluid" />
                    </div>
                  </div>
                  <div className="card-body p-0 mt-4">
                    <h3 className="card-title text-capitalize">
                      <Link href="/blog-post">Best looking jewellery for weddings</Link>
                    </h3>
                    <p>
                      Enim ut nunc, ultrices mauris felis viverra amet. Ante sed dictum nisi suscipit ac ut faucibus pretium
                      interdum.
                    </p>
                    <Link href="/blog-post" className="btn btn-normal text-capitalize p-0"><em>Read More</em></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
