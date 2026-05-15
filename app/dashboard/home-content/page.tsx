"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HomeContent {
  billboard: {
    slides: {
      image: string;
      title: string;
      description: string;
      buttonText: string;
      buttonLink: string;
    }[];
  };
  banner: {
    items: {
      image: string;
      title: string;
      buttonText: string;
      buttonLink: string;
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

export default function HomeContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/home-content", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        router.push("/dashboard/login");
      }
    } catch (error) {
      console.error("Error fetching home content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/home-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        alert("Home content updated successfully!");
      } else {
        alert("Failed to update home content");
      }
    } catch (error) {
      console.error("Error saving home content:", error);
      alert("Error saving home content");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof HomeContent, field: string, value: string | string[]) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
  };

  const handleSlideChange = (slideIndex: number, field: string, value: string) => {
    if (!content) return;
    const newSlides = [...content.billboard.slides];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      [field]: value,
    };
    setContent({
      ...content,
      billboard: {
        ...content.billboard,
        slides: newSlides,
      },
    });
  };

  const handleBannerChange = (bannerIndex: number, field: string, value: string) => {
    if (!content) return;
    const newItems = [...content.banner.items];
    newItems[bannerIndex] = {
      ...newItems[bannerIndex],
      [field]: value,
    };
    setContent({
      ...content,
      banner: {
        ...content.banner,
        items: newItems,
      },
    });
  };

  const handleTestimonialChange = (testimonialIndex: number, field: string, value: string) => {
    if (!content) return;
    const newItems = [...content.testimonials.items];
    newItems[testimonialIndex] = {
      ...newItems[testimonialIndex],
      [field]: value,
    };
    setContent({
      ...content,
      testimonials: {
        ...content.testimonials,
        items: newItems,
      },
    });
  };

  const handleAddSlide = () => {
    if (!content) return;
    setContent({
      ...content,
      billboard: {
        ...content.billboard,
        slides: [
          ...content.billboard.slides,
          {
            image: "",
            title: "",
            description: "",
            buttonText: "Shop Now",
            buttonLink: "/shop",
          },
        ],
      },
    });
  };

  const handleRemoveSlide = (index: number) => {
    if (!content) return;
    const newSlides = content.billboard.slides.filter((_, i) => i !== index);
    setContent({
      ...content,
      billboard: {
        ...content.billboard,
        slides: newSlides,
      },
    });
  };

  const handleAddBanner = () => {
    if (!content) return;
    setContent({
      ...content,
      banner: {
        ...content.banner,
        items: [
          ...content.banner.items,
          {
            image: "",
            title: "",
            buttonText: "Shop Now",
            buttonLink: "/shop",
          },
        ],
      },
    });
  };

  const handleRemoveBanner = (index: number) => {
    if (!content) return;
    const newItems = content.banner.items.filter((_, i) => i !== index);
    setContent({
      ...content,
      banner: {
        ...content.banner,
        items: newItems,
      },
    });
  };

  const handleImageUpload = async (section: string, index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "home");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;

        if (section === "billboard") {
          handleSlideChange(index, "image", imageUrl);
        } else if (section === "banner") {
          handleBannerChange(index, "image", imageUrl);
        } else if (section === "featured") {
          handleFeaturedProductChange(index, "image", imageUrl);
        } else if (section === "trending") {
          handleTrendingProductChange(index, "image", imageUrl);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  const handleFeaturedProductChange = (index: number, field: string, value: string) => {
    if (!content) return;
    const newProducts = [...content.featuredProducts.products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };
    setContent({
      ...content,
      featuredProducts: {
        ...content.featuredProducts,
        products: newProducts,
      },
    });
  };

  const handleTrendingProductChange = (index: number, field: string, value: string) => {
    if (!content) return;
    const newProducts = [...content.trendingProducts.products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };
    setContent({
      ...content,
      trendingProducts: {
        ...content.trendingProducts,
        products: newProducts,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f5f2]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#704204]" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f5f2]">
        <div className="text-center">
          <p className="text-gray-600">Failed to load home content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#eeede9] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-stone-900">Home Page Content</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#704204] text-white rounded-lg hover:bg-[#8a5626] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Billboard Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-900">Billboard Slides</h2>
            <button
              onClick={handleAddSlide}
              className="px-4 py-2 bg-[#704204] text-white rounded-lg hover:bg-[#8a5626]"
            >
              + Add Slide
            </button>
          </div>
          {content.billboard.slides.map((slide, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-stone-800">Slide {index + 1}</h3>
                <button
                  onClick={() => handleRemoveSlide(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
                  {slide.image && (
                    <img src={slide.image} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("billboard", index, file);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => handleSlideChange(index, "image", e.target.value)}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204] mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleSlideChange(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => handleSlideChange(index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={slide.buttonText}
                    onChange={(e) => handleSlideChange(index, "buttonText", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={slide.buttonLink}
                    onChange={(e) => handleSlideChange(index, "buttonLink", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-900">Banner Items</h2>
            <button
              onClick={handleAddBanner}
              className="px-4 py-2 bg-[#704204] text-white rounded-lg hover:bg-[#8a5626]"
            >
              + Add Banner
            </button>
          </div>
          {content.banner.items.map((item, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-stone-800">Banner {index + 1}</h3>
                <button
                  onClick={() => handleRemoveBanner(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
                  {item.image && (
                    <img src={item.image} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("banner", index, file);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => handleBannerChange(index, "image", e.target.value)}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204] mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={item.buttonText}
                    onChange={(e) => handleBannerChange(index, "buttonText", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={item.buttonLink}
                    onChange={(e) => handleBannerChange(index, "buttonLink", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* About Us Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <h2 className="text-xl font-semibold mb-4 text-stone-900">About Us Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                type="text"
                value={content.aboutUs.title}
                onChange={(e) => handleInputChange("aboutUs", "title", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                value={content.aboutUs.description}
                onChange={(e) => handleInputChange("aboutUs", "description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.aboutUs.buttonText}
                onChange={(e) => handleInputChange("aboutUs", "buttonText", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
              <input
                type="text"
                value={content.aboutUs.buttonLink}
                onChange={(e) => handleInputChange("aboutUs", "buttonLink", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <h2 className="text-xl font-semibold mb-4 text-stone-900">Featured Products Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                type="text"
                value={content.featuredProducts.title}
                onChange={(e) => handleInputChange("featuredProducts", "title", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.featuredProducts.buttonText}
                onChange={(e) => handleInputChange("featuredProducts", "buttonText", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
              <input
                type="text"
                value={content.featuredProducts.buttonLink}
                onChange={(e) => handleInputChange("featuredProducts", "buttonLink", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-3 text-stone-800">Products (4 items)</h3>
          {content.featuredProducts.products.map((product, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-4 mb-4">
              <h4 className="text-md font-medium mb-3 text-stone-800">Product {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
                  {product.image && (
                    <img src={product.image} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("featured", index, file);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                  <input
                    type="text"
                    value={product.image}
                    onChange={(e) => handleFeaturedProductChange(index, "image", e.target.value)}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204] mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleFeaturedProductChange(index, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => handleFeaturedProductChange(index, "price", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={product.slug}
                    onChange={(e) => handleFeaturedProductChange(index, "slug", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <h2 className="text-xl font-semibold mb-4 text-stone-900">Testimonials</h2>
          {content.testimonials.items.map((testimonial, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium mb-3 text-stone-800">Testimonial {index + 1}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Quote</label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => handleTestimonialChange(index, "quote", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={testimonial.author}
                    onChange={(e) => handleTestimonialChange(index, "author", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Products Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <h2 className="text-xl font-semibold mb-4 text-stone-900">Trending Products Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                type="text"
                value={content.trendingProducts.title}
                onChange={(e) => handleInputChange("trendingProducts", "title", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.trendingProducts.buttonText}
                onChange={(e) => handleInputChange("trendingProducts", "buttonText", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
              <input
                type="text"
                value={content.trendingProducts.buttonLink}
                onChange={(e) => handleInputChange("trendingProducts", "buttonLink", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-3 text-stone-800">Products (4 items)</h3>
          {content.trendingProducts.products.map((product, index) => (
            <div key={index} className="border border-stone-200 rounded-lg p-4 mb-4">
              <h4 className="text-md font-medium mb-3 text-stone-800">Product {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
                  {product.image && (
                    <img src={product.image} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("trending", index, file);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                  <input
                    type="text"
                    value={product.image}
                    onChange={(e) => handleTrendingProductChange(index, "image", e.target.value)}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204] mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleTrendingProductChange(index, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => handleTrendingProductChange(index, "price", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={product.slug}
                    onChange={(e) => handleTrendingProductChange(index, "slug", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Blog Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-stone-200">
          <h2 className="text-xl font-semibold mb-4 text-stone-900">Latest Blog Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                type="text"
                value={content.latestBlog.title}
                onChange={(e) => handleInputChange("latestBlog", "title", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.latestBlog.buttonText}
                onChange={(e) => handleInputChange("latestBlog", "buttonText", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Button Link</label>
              <input
                type="text"
                value={content.latestBlog.buttonLink}
                onChange={(e) => handleInputChange("latestBlog", "buttonLink", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#704204]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
