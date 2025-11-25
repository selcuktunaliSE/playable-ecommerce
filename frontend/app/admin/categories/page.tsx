"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  const isEditMode = Boolean(editingId);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/admin/categories`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to load categories");
      }

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("NEXT_PUBLIC_API_BASE_URL is not configured");
      return;
    }
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.slug) {
      setError("Name and slug are required");
      return;
    }

    try {
      setLoading(true);

      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        isActive: form.isActive
      };

      const url = editingId
        ? `${API_BASE_URL}/admin/categories/${editingId}`
        : `${API_BASE_URL}/admin/categories`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to save category");
      }

      await loadCategories();
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (cat: AdminCategory) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      isActive: cat.isActive ?? true
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete category");
      }
      await loadCategories();
      if (editingId === id) resetForm();
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin – Categories
          </h1>
          <p className="text-sm text-slate-400">
            Manage product categories used across the store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="text-xs text-slate-400 hover:text-slate-100 hover:underline"
          >
            Go to Products →
          </Link>
          <Link
            href="/"
            className="text-xs text-orange-400 hover:text-orange-300 hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-50">
            {isEditMode ? "Edit category" : "Add new category"}
          </h2>
          {isEditMode && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Slug</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="e.g. laptops, accessories"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs text-slate-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[60px]"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Optional description for internal use or SEO."
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              id="catIsActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-3 w-3 rounded border-slate-600 bg-slate-900"
            />
            <label
              htmlFor="catIsActive"
              className="text-xs text-slate-300"
            >
              Active
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-orange-500 text-xs font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save changes"
                  : "Create category"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-50">
          Categories ({categories.length})
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/80">
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Slug</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-center">Active</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-b border-slate-800/70 hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2 align-middle text-slate-50">
                    {cat.name}
                  </td>
                  <td className="px-3 py-2 align-middle text-slate-300">
                    {cat.slug}
                  </td>
                  <td className="px-3 py-2 align-middle text-slate-400 max-w-[280px]">
                    <span className="line-clamp-2">
                      {cat.description || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-center">
                    <span
                      className={
                        cat.isActive ?? true
                          ? "inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-300 border border-emerald-500/40"
                          : "inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-600"
                      }
                    >
                      {cat.isActive ?? true ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="text-[11px] text-orange-300 hover:text-orange-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat._id)}
                        className="text-[11px] text-rose-300 hover:text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
