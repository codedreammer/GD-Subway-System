"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, X } from "lucide-react";

export default function AddItemModal({ vendorId, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const hasCategories = categories.length > 0;

  useEffect(() => {
    if (!categoryId && hasCategories) {
      setCategoryId(String(categories[0].id));
    }
  }, [categoryId, categories, hasCategories]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasCategories) {
      alert("No active categories found. Please create/activate a category first.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: vendorId,
        name,
        price,
        category_id: categoryId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    setOpen(false);
    setName("");
    setPrice("");
    setCategoryId(hasCategories ? String(categories[0].id) : "");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="premium-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
        type="button"
      >
        <PackagePlus className="h-4 w-4" />
        Add item
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-34px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Catalog update</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Add new item</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <input
                type="text"
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="premium-input w-full px-4 py-3 text-sm text-slate-800"
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="premium-input w-full px-4 py-3 text-sm text-slate-800"
                required
              />

              {hasCategories ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="premium-input w-full px-4 py-3 text-sm text-slate-800"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  No active categories available. Add a category before creating items.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="premium-button-secondary px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !hasCategories}
                  className="premium-button px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Adding..." : "Add item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
