"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ItemActions({ item }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);

  async function handleDelete() {
    if (!confirm("Delete this item?")) return;

    await fetch("/api/admin/delete-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id }),
    });

    router.refresh();
  }

  async function handleUpdate(e) {
    e.preventDefault();

    await fetch("/api/admin/update-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: item.id,
        name,
        price,
      }),
    });

    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="premium-input px-4 py-2 text-sm text-slate-800"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="premium-input w-28 px-4 py-2 text-sm text-slate-800"
        />
        <div className="flex gap-2">
          <button type="submit" className="premium-button px-4 py-2 text-sm font-semibold">
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="premium-button-secondary px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setEditing(true)}
        className="premium-button-secondary px-4 py-2 text-sm font-semibold"
        type="button"
      >
        Edit
      </button>

      <button
        onClick={handleDelete}
        className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100"
        type="button"
      >
        Delete
      </button>
    </div>
  );
}
