"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
};

type Category = {
  _id: string;
  name: string;
};

type FormState = {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  images: string[];      
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  price: "",
  stock: "",
  categoryId: "",
  images: [],
  isActive: true
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token,loading:authLoading } = useAuth(); 
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); 
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canBulkAction = selectedIds.length > 0;

  const fetchData = async () => {
    if (!API_BASE_URL) {
      setError("API base URL is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/products`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/categories`)
      ]);

      if (!prodRes.ok) {
        console.log("prodRes status:", prodRes.status);
        throw new Error("Failed to load products");
      }
      if (!catRes.ok) {
        throw new Error("Failed to load categories");
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      const items = Array.isArray(prodData.items) ? prodData.items : [];
      setProducts(items);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(authLoading) return;

    if (!user) {
      router.push("/login?from=/admin/products");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if(authLoading) return;
    if (!user || user.role !== "admin") return;
    fetchData();
  }, [authLoading, user, token]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormMode("create");
  };

  const handleCreateClick = () => {
    resetForm();
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleEditClick = (product: AdminProduct) => {
    setFormMode("edit");
    setEditingId(product._id);
    setForm({
      name: product.name ?? "",
      price: product.price != null ? String(product.price) : "",
      stock: product.stock != null ? String(product.stock) : "",
      categoryId: product.category?._id ?? "",
      images: product.images ?? [],       
      isActive: product.isActive ?? true
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!API_BASE_URL) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete product");
      }

      setSuccess("Product deleted.");
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileUpload = async (file: File) => {
    if (!API_BASE_URL || !file) return;
    if (!token) {
      setError("You must be logged in as admin to upload images.");
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${API_BASE_URL}/admin/upload/product-image`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Image upload failed");
      }

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, data.url] 
      }));
      setSuccess("Image uploaded successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((u) => u !== url)
    }));
  };

  const handleSetMainImage = (url: string) => {
    setForm((prev) => {
      const rest = prev.images.filter((u) => u !== url);
      return { ...prev, images: [url, ...rest] };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) return;

    setError(null);
    setSuccess(null);

    if (!form.name || !form.price || !form.stock) {
      setError("Name, price and stock are required.");
      return;
    }

    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const payload = {
      name: form.name,
      slug,
      categoryId: form.categoryId || null,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
      images: form.images 
    };

    try {
      setLoading(true);
      const url =
        formMode === "edit" && editingId
          ? `${API_BASE_URL}/admin/products/${editingId}`
          : `${API_BASE_URL}/admin/products`;
      const method = formMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to save product");
      }

      setSuccess(
        formMode === "edit"
          ? "Product updated successfully."
          : "Product created successfully."
      );
      await fetchData();
      if (formMode === "create") {
        resetForm();
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const handleBulkStatus = async (isActive: boolean) => {
    if (!API_BASE_URL) return;
    if (selectedIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_BASE_URL}/admin/products/bulk-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, isActive }),
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update status");
      }

      setSuccess(
        isActive
          ? "Selected products activated."
          : "Selected products deactivated."
      );
      setSelectedIds([]);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong on bulk update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin – Products
          </h1>
          <p className="text-sm text-slate-400">
            Manage products, stock and visibility. Out-of-stock and inactive
            products are hidden from customers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 shadow-sm hover:bg-orange-400 transition cursor-pointer"
        >
          + New product
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-700 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
          {success}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              {formMode === "edit" ? "Edit product" : "Create new product"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>

          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-300">Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Stock</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.stock}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stock: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Category</label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: e.target.value
                  }))
                }
              >
                <option value="">(No category)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-300">
                Product images (first one is main)
              </label>

              {form.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {form.images.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative inline-block"
                    >
                      <img
                        src={url}
                        alt={form.name || `Image ${idx + 1}`}
                        className="h-20 w-20 rounded-lg object-cover border border-slate-700"
                      />
                      {idx === 0 && (
                        <span className="absolute -top-1 -left-1 rounded-full bg-orange-500 text-[9px] px-1.5 py-[1px] text-slate-950 font-semibold">
                          Main
                        </span>
                      )}
                      <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(url)}
                            className="px-1.5 py-[1px] text-[9px] rounded-full bg-slate-900/80 text-slate-100 border border-slate-600 cursor-pointer"
                          >
                            Set main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          className="px-1.5 py-[1px] text-[9px] rounded-full bg-rose-900/80 text-rose-100 border border-rose-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-3 py-4 text-xs text-slate-400 flex flex-col items-center justify-center gap-2"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    void handleImageFileUpload(file);
                  }
                }}
              >
                <p>Drag & drop an image file here</p>
                <p className="text-[10px] text-slate-500">or</p>

                <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-800 text-[11px] text-slate-100 cursor-pointer hover:bg-slate-700">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleImageFileUpload(file);
                      }
                    }}
                  />
                </label>

                {uploadingImage && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Uploading…
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="isActive"
                type="checkbox"
                className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked
                  }))
                }
              />
              <label htmlFor="isActive" className="text-xs text-slate-300">
                Active
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2.5 rounded-full bg-orange-500 text-xs font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading
                  ? formMode === "edit"
                    ? "Saving..."
                    : "Creating..."
                  : formMode === "edit"
                  ? "Save changes"
                  : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {products.length} product
          {products.length !== 1 ? "s" : ""} total
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canBulkAction || loading}
            onClick={() => handleBulkStatus(true)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
              canBulkAction
                ? "border-emerald-500/60 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200 cursor-pointer"
                : "border-slate-700 text-slate-600 cursor-not-allowed"
            }`}
          >
            Activate selected
          </button>
          <button
            type="button"
            disabled={!canBulkAction || loading}
            onClick={() => handleBulkStatus(false)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
              canBulkAction
                ? "border-amber-500/60 text-amber-300 hover:border-amber-400 hover:text-amber-200 cursor-pointer"
                : "border-slate-700 text-slate-600 cursor-not-allowed"
            }`}
          >
            Deactivate selected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 cursor-pointer"
                  checked={
                    products.length > 0 &&
                    selectedIds.length === products.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-2 text-left text-slate-300">Name</th>
              <th className="px-3 py-2 text-left text-slate-300">Category</th>
              <th className="px-3 py-2 text-right text-slate-300">Price</th>
              <th className="px-3 py-2 text-right text-slate-300">Stock</th>
              <th className="px-3 py-2 text-center text-slate-300">Status</th>
              <th className="px-3 py-2 text-right text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const selected = selectedIds.includes(p._id);
              const outOfStock = p.stock <= 0;
              return (
                <tr
                  key={p._id}
                  className="border-t border-slate-800 hover:bg-slate-900/70"
                >
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-slate-600 bg-slate-900 cursor-pointer"
                      checked={selected}
                      onChange={() => toggleSelect(p._id)}
                    />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-slate-300">
                    {p.category?.name ?? (
                      <span className="text-slate-500">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle text-right text-slate-100">
                    ${Number(p.price ?? 0).toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-2 align-middle text-right ${
                      outOfStock ? "text-rose-300" : "text-slate-100"
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    {p.isActive ? (
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/40">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-700/20 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-600/60">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(p)}
                        className="text-[11px] text-orange-300 hover:text-orange-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  No products found. Click{" "}
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className="text-orange-400 hover:underline cursor-pointer"
                  >
                    New product
                  </button>{" "}
                  to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="text-[11px] text-slate-500">Loading / saving…</p>
      )}
    </div>
  );
}
