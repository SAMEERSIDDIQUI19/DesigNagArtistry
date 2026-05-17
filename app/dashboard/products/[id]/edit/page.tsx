"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    sku: "",
    brand: "",
    price: "",
    salePrice: "",
    costPrice: "",
    isOnSale: false,
    stock: "0",
    thumbnail: "",
    thumbnailFiles: [] as File[],
    additionalImages: [] as File[],
    weight: "",
    status: "active",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    categoryId: "",
  });

  const handleDeleteThumbnail = (indexToDelete: number) => {
    const thumbnails = formData.thumbnail.split(",");
    const newThumbnails = thumbnails.filter((_, index) => index !== indexToDelete);
    setFormData({
      ...formData,
      thumbnail: newThumbnails.join(","),
    });
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [params.id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error("Failed to fetch categories:", response.status);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/products/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          sku: product.sku || "",
          brand: product.brand || "",
          price: product.price.toString(),
          salePrice: product.salePrice ? product.salePrice.toString() : "",
          costPrice: product.costPrice ? product.costPrice.toString() : "",
          isOnSale: product.isOnSale,
          stock: product.stock.toString(),
          thumbnail: product.thumbnail || "",
          thumbnailFiles: [],
          additionalImages: [],
          weight: product.weight ? product.weight.toString() : "",
          status: product.status,
          featured: product.featured,
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          categoryId: product.categoryId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Build product payload — exclude File arrays which cannot be serialized
      const productPayload = {
        name: formData.name,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        description: formData.description,
        sku: formData.sku,
        brand: formData.brand,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        isOnSale: formData.isOnSale,
        stock: parseInt(formData.stock),
        thumbnail: formData.thumbnail,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        status: formData.status,
        featured: formData.featured,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        categoryId: formData.categoryId || null,
      };

      // Update product data first
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to update product");
        return;
      }

      // We already know the product ID from the URL — use it directly for uploads
      const productId = params.id as string;

      // Upload new thumbnails if provided → /uploads/{productId}/filename
      if (formData.thumbnailFiles.length > 0) {
        try {
          const thumbnailUrls = [];
          for (const file of formData.thumbnailFiles) {
            const imageUrl = await handleFileUploadWithProductId(file, productId);
            thumbnailUrls.push(imageUrl);
          }

          // Combine with existing thumbnails
          const existingThumbnails = formData.thumbnail
            ? formData.thumbnail.split(",").map((u) => u.trim()).filter(Boolean)
            : [];
          const allThumbnails = [...existingThumbnails, ...thumbnailUrls];

          // Patch only the thumbnail field
          await fetch(`/api/admin/products/${productId}/thumbnail`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ thumbnail: allThumbnails.join(",") }),
          });
        } catch (uploadError) {
          console.error("Thumbnail upload failed:", uploadError);
          alert("Product saved but thumbnail upload failed. Please try uploading the image again.");
        }
      }

      // Upload additional images → /uploads/{productId}/filename
      if (formData.additionalImages.length > 0) {
        for (let i = 0; i < formData.additionalImages.length; i++) {
          try {
            const imageUrl = await handleFileUploadWithProductId(formData.additionalImages[i], productId);
            await fetch("/api/admin/product-images", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ productId, imageUrl, sortOrder: i }),
            });
          } catch (uploadError) {
            console.error("Additional image upload failed:", uploadError);
          }
        }
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFormData({
      ...formData,
      thumbnailFiles: Array.from(files),
    });
  };

  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFormData({
      ...formData,
      additionalImages: Array.from(files),
    });
  };

  const handleFileUploadWithProductId = async (file: File, productId: string) => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("productId", productId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <input
                type="number"
                name="salePrice"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price
              </label>
              <input
                type="number"
                name="costPrice"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">On Sale</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              rows={2}
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
              minHeight={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Images
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.thumbnailFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{formData.thumbnailFiles.length} file(s) selected</p>
                  <ul className="text-sm text-gray-500 mt-1">
                    {formData.thumbnailFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.thumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Existing thumbnails:</p>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.thumbnail.split(",").map((thumb, index) => (
                      <div key={index} className="relative">
                        <img
                          src={thumb}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteThumbnail(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{thumb}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (Multiple Upload)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.additionalImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{formData.additionalImages.length} file(s) selected</p>
                  <ul className="text-sm text-gray-500 mt-1">
                    {formData.additionalImages.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              rows={2}
              value={formData.metaDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
