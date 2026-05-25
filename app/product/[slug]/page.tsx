"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  isOnSale: boolean;
  stock: number;
  thumbnail: string | null;
  sizeChart: string | null;
  weight: number | null;
  sku: string | null;
  brand: string | null;
  status: string;
  category: {
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    imageUrl: string;
  }[];
  variants: {
    id: string;
    variantName: string;
    variantValue: string;
    price: number | null;
    stock: number;
  }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0, bgPosX: 0, bgPosY: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeChartUrl, setSizeChartUrl] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;
    
    // Calculate position for magnifier (centered on cursor)
    const magnifierSize = 128;
    const offsetX = x - magnifierSize / 2;
    const offsetY = y - magnifierSize / 2;
    
    // Calculate background position for zoom effect
    // The background image should be 3x the size, so we need to adjust position accordingly
    const zoomLevel = 3;
    const bgPosX = -(x * zoomLevel - magnifierSize / 2);
    const bgPosY = -(y * zoomLevel - magnifierSize / 2);
    
    setMagnifierPosition({ x: offsetX, y: offsetY, bgPosX, bgPosY });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

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
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      console.log("Fetching product for slug:", params.slug);
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.ok) {
        setProduct(data);
        
        // Parse thumbnail URLs safely (handles base64 data URLs)
        const { parseThumbnails } = await import("@/lib/thumbnail-utils");
        const thumbnailUrls = parseThumbnails(data.thumbnail);
        
        // Combine thumbnail URLs with ProductImage images
        const productImageUrls = data.images.map((img: any) => img.imageUrl);
        const allProductImages = [...thumbnailUrls, ...productImageUrls];
        
        setAllImages(allProductImages);
        setSelectedImage(allProductImages.length > 0 ? allProductImages[0] : null);
        setSizeChartUrl(data.sizeChart || null);
      } else {
        console.error("Failed to fetch product:", data.error);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
          variantId: selectedVariant,
        }),
      });

      if (response.ok) {
        console.log("Product added to cart");
        // Dispatch event to update cart count in header
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const displayPrice = () => {
    if (!product) return null;
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;

    if (product.isOnSale && salePrice) {
      return (
        <>
          <span className="text-gray-400 line-through text-2xl mr-3">Rs. {price.toFixed(2)}</span>
          <span className="text-red-600 font-bold text-3xl">Rs. {salePrice.toFixed(2)}</span>
        </>
      );
    }
    return <span className="font-bold text-3xl">Rs. {price.toFixed(2)}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/shop" className="text-blue-600 hover:text-blue-800">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div 
              ref={containerRef}
              className="bg-white rounded-lg shadow-md overflow-hidden mb-4 relative overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {selectedImage ? (
                <>
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt={product.name}
                    className="w-full object-contain cursor-pointer"
                    onClick={() => handleImageClick(allImages.indexOf(selectedImage))}
                  />
                  {showMagnifier && (
                    <div
                      className="absolute w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden shadow-lg pointer-events-none"
                      style={{
                        left: `${magnifierPosition.x}px`,
                        top: `${magnifierPosition.y}px`,
                        backgroundImage: `url(${selectedImage})`,
                        backgroundSize: `${(containerRef.current?.offsetWidth || 0) * 3}px ${(containerRef.current?.offsetHeight || 0) * 3}px`,
                        backgroundPosition: `${magnifierPosition.bgPosX}px ${magnifierPosition.bgPosY}px`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            {allImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImage(imageUrl);
                      handleImageClick(index);
                    }}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                      selectedImage === imageUrl
                        ? "border-blue-600"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <Link
                href="/shop"
                onClick={() => {
                  // Navigate to shop with category selected
                  window.location.href = `/shop?category=${product.category?.slug}`;
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mt-2 mb-4">
              {product.name}
            </h1>

            <div className="mb-6">{displayPrice()}</div>

            {product.shortDescription && (
              <p className="text-gray-600 mb-6">{product.shortDescription}</p>
            )}

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                {/<[a-z][\s\S]*>/i.test(product.description) ? (
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                )}
              </div>
            )}

            {/* Size Chart Accordion */}
            {sizeChartUrl && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(!sizeChartOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Size Chart</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${sizeChartOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {sizeChartOpen && (
                  <div className="mt-1 border border-gray-200 rounded-b-lg overflow-hidden bg-white p-3">
                    <img
                      src={sizeChartUrl}
                      alt={`Size chart for ${product.name}`}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {product.sku && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
            )}

            {product.brand && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Brand: {product.brand}</span>
              </div>
            )}

            {product.weight && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Weight: {product.weight} kg</span>
              </div>
            )}

            {/* Select Size */}
            {product.variants.filter(v => v.variantName === "size").length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants
                    .filter(v => v.variantName === "size")
                    .map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => { setSelectedVariant(variant.id); setQuantity(1); }}
                        disabled={variant.stock === 0}
                        className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                          selectedVariant === variant.id
                            ? "border-black bg-black text-white"
                            : variant.stock === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-black text-gray-900"
                        }`}
                      >
                        {variant.variantValue}
                        {variant.stock === 0 && <span className="ml-1 text-xs">(Out of Stock)</span>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 bg-white text-black"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <div className="w-16 px-4 py-2 border-t border-b border-gray-300 text-center bg-white text-black">
                  {quantity}
                </div>
                <button
                  onClick={() => {
                    const maxQty = selectedVariant
                      ? (product.variants.find(v => v.id === selectedVariant)?.stock ?? product.stock)
                      : product.stock;
                    setQuantity(Math.min(maxQty, quantity + 1));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 bg-white text-black"
                  disabled={quantity >= (selectedVariant
                    ? (product.variants.find(v => v.id === selectedVariant)?.stock ?? product.stock)
                    : product.stock)}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVariant
                  ? `${product.variants.find(v => v.id === selectedVariant)?.stock ?? 0} items available`
                  : `${product.stock} items available`}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={
                product.status !== "active" ||
                (product.variants.filter(v => v.variantName === "size").length > 0 && !selectedVariant) ||
                (selectedVariant
                  ? (product.variants.find(v => v.id === selectedVariant)?.stock ?? 0) === 0
                  : product.stock === 0)
              }
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {product.variants.filter(v => v.variantName === "size").length > 0 && !selectedVariant
                ? "Select a Size"
                : selectedVariant
                ? ((product.variants.find(v => v.id === selectedVariant)?.stock ?? 0) === 0 ? "Out of Stock" : "Add to Cart")
                : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:space-x-4">
              <Link
                href="/shop"
                className="flex-1 text-center border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/cart"
                className="flex-1 text-center bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          
          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10"
          >
            ‹
          </button>
          
          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10"
          >
            ›
          </button>
          
          <img
            src={allImages[currentImageIndex]}
            alt={`Product image ${currentImageIndex + 1}`}
            className="max-w-full max-h-screen object-contain"
          />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
