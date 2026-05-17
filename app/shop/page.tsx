"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPrimaryThumbnail } from "@/lib/thumbnail-utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  thumbnail: string | null;
  isOnSale: boolean;
  stock: number;
  status: string;
  category: {
    name: string;
  } | null;
  images: {
    imageUrl: string;
  }[];
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  children: CategoryNode[];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(selectedCategory && { category: selectedCategory }),
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Products data received:", data);
        if (data.products && data.products.length > 0) {
          console.log("First product:", JSON.stringify(data.products[0], null, 2));
        }
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
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

  const displayPrice = (product: Product) => {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;

    if (product.isOnSale && salePrice) {
      return (
        <>
          <span className="text-gray-400 line-through mr-2">Rs. {price.toFixed(2)}</span>
          <span className="text-red-600 font-bold">Rs. {salePrice.toFixed(2)}</span>
        </>
      );
    }
    return <span className="font-bold">Rs. {price.toFixed(2)}</span>;
  };

  const getProductImage = (product: Product): string => {
    console.log("Getting image for product:", product.name);
    console.log("Thumbnail:", product.thumbnail);
    console.log("Images:", product.images);
    
    // If thumbnail exists, use it
    if (product.thumbnail) {
      const imageUrl = getPrimaryThumbnail(product.thumbnail) || '/images/placeholder.jpg';
      console.log("Using thumbnail:", imageUrl);
      return imageUrl;
    }
    // Otherwise, use the first image from images array if available
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0].imageUrl.startsWith('/') ? product.images[0].imageUrl : `/${product.images[0].imageUrl}`;
      console.log("Using first image from array:", imageUrl);
      return imageUrl;
    }
    // Fallback to placeholder
    console.log("No images found, using placeholder");
    return '/images/placeholder.jpg';
  };

  const renderCategoryTree = (category: CategoryNode, level: number = 0) => {
    const isSelected = selectedCategory === category.id;
    const isExpanded = expandedCategories.has(category.id);
    const paddingLeft = level * 20;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            console.log("Category clicked:", category.id, category.name);
            if (hasChildren) {
              // Toggle expand/collapse for parent categories
              setExpandedCategories((prev: Set<string>) => {
                const newSet = new Set(prev);
                if (newSet.has(category.id)) {
                  newSet.delete(category.id);
                } else {
                  newSet.add(category.id);
                }
                return newSet;
              });
            } else {
              // Select leaf categories for filtering
              setSelectedCategory(isSelected ? "" : category.id);
            }
          }}
          className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center ${
            isSelected
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100"
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          {hasChildren && (
            <span className="mr-2 text-xs">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          {!hasChildren && <span className="mr-2 text-xs opacity-0">•</span>}
          {category.name}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map((child) => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const flattenCategories = (categories: CategoryNode[]): CategoryNode[] => {
    const result: CategoryNode[] = [];
    const flatten = (cats: CategoryNode[]) => {
      cats.forEach((cat) => {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };
    flatten(categories);
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-[#c37409] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Shop Our Collection</h1>
          <p className="text-xl text-gray-300">Discover our latest fashion trends</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {flattenCategories(categories).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              {categories.length > 0 ? (
                <div className="space-y-1">
                  {categories.map((category) => renderCategoryTree(category))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No categories available</p>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative h-64 bg-gray-200">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {product.isOnSale && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                          SALE
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    {product.category && (
                      <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
                    )}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg">{displayPrice(product)}</div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0 || product.status !== "active"}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
