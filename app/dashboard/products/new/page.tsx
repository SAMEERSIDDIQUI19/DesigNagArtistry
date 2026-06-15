"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

interface Category {
  id: string;
  name: string;
}

interface Fabric {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  hexCode: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sizes, setSizes] = useState<{ size: string; stock: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [newFabrics, setNewFabrics] = useState<string[]>([]);
  const [newColors, setNewColors] = useState<{ name: string; hexCode: string }[]>([]);
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
    weight: "",
    status: "active",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchFabrics();
    fetchColors();
  }, []);

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

  const fetchFabrics = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/fabrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFabrics(data);
      } else {
        console.error("Failed to fetch fabrics:", response.status);
      }
    } catch (error) {
      console.error("Error fetching fabrics:", error);
    }
  };

  const fetchColors = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/colors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setColors(data);
      } else {
        console.error("Failed to fetch colors:", response.status);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("admin_token");

      // Step 1: Save all product details (exclude File arrays — not serializable)
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
        weight: formData.weight ? parseFloat(formData.weight) : null,
        status: formData.status,
        featured: formData.featured,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        categoryId: formData.categoryId || null,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to create product");
        return;
      }

      const product = await response.json();

      // Save size variants if any
      const validSizes = sizes.filter(s => s.size.trim());
      if (validSizes.length > 0) {
        await fetch(`/api/admin/products/${product.id}/variants`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sizes: validSizes.map(s => ({ size: s.size.trim(), stock: parseInt(s.stock) || 0 })),
          }),
        });
      }

      // Create new fabrics and associate with product
      const validFabrics = newFabrics.filter(f => f.trim());
      const fabricIds: string[] = [];
      for (const fabricName of validFabrics) {
        const response = await fetch("/api/admin/fabrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: fabricName.trim() }),
        });
        if (response.ok) {
          const fabric = await response.json();
          fabricIds.push(fabric.id);
        }
      }

      if (fabricIds.length > 0) {
        await fetch(`/api/admin/products/${product.id}/fabrics`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fabricIds }),
        });
      }

      // Create new colors and associate with product
      const validColors = newColors.filter(c => c.name.trim());
      const colorIds: string[] = [];
      for (const color of validColors) {
        const response = await fetch("/api/admin/colors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: color.name.trim(), hexCode: color.hexCode }),
        });
        if (response.ok) {
          const colorData = await response.json();
          colorIds.push(colorData.id);
        }
      }

      if (colorIds.length > 0) {
        await fetch(`/api/admin/products/${product.id}/colors`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ colorIds }),
        });
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const addSize = () => setSizes(prev => [...prev, { size: "", stock: "0" }]);
  const removeSize = (index: number) => setSizes(prev => prev.filter((_, i) => i !== index));
  const updateSize = (index: number, field: "size" | "stock", value: string) => {
    setSizes(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Sizes &amp; Stock</label>
              <button
                type="button"
                onClick={addSize}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Size
              </button>
            </div>
            {sizes.length === 0 ? (
              <p className="text-sm text-gray-400">No sizes added. Click &quot;+ Add Size&quot; to add size options with individual stock quantities.</p>
            ) : (
              <div className="space-y-2">
                {sizes.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. XS, S, M, L, XL"
                      value={item.size}
                      onChange={(e) => updateSize(index, "size", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      min="0"
                      value={item.stock}
                      onChange={(e) => updateSize(index, "stock", e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Fabrics</label>
              <button
                type="button"
                onClick={() => setNewFabrics([...newFabrics, ""])}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Fabric
              </button>
            </div>
            {newFabrics.length === 0 ? (
              <p className="text-sm text-gray-400">No fabrics added. Click &quot;+ Add Fabric&quot; to add fabric options.</p>
            ) : (
              <div className="space-y-2">
                {newFabrics.map((fabric, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Cotton, Silk, Linen"
                      value={fabric}
                      onChange={(e) => {
                        const updated = [...newFabrics];
                        updated[index] = e.target.value;
                        setNewFabrics(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setNewFabrics(newFabrics.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Colors</label>
              <button
                type="button"
                onClick={() => setNewColors([...newColors, { name: "", hexCode: "#000000" }])}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Color
              </button>
            </div>
            {newColors.length === 0 ? (
              <p className="text-sm text-gray-400">No colors added. Click &quot;+ Add Color&quot; to add color options.</p>
            ) : (
              <div className="space-y-2">
                {newColors.map((color, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Color name"
                      value={color.name}
                      onChange={(e) => {
                        const updated = [...newColors];
                        updated[index].name = e.target.value;
                        setNewColors(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={color.hexCode}
                      onChange={(e) => {
                        const updated = [...newColors];
                        updated[index].hexCode = e.target.value;
                        setNewColors(updated);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                    <input
                      type="color"
                      value={color.hexCode}
                      onChange={(e) => {
                        const updated = [...newColors];
                        updated[index].hexCode = e.target.value;
                        setNewColors(updated);
                      }}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setNewColors(newColors.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
