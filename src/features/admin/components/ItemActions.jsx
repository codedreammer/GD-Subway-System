"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";

export default function ItemActions({ item }) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [loading, setLoading] = useState(false);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token;
  }

  async function handleDelete() {
    if (!confirm("Delete this item?")) return;

    setLoading(true);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        alert("Unauthorized. Please login again.");
        return;
      }

      const res = await fetch("/api/admin/delete-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          item_id: item.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete item.");
        return;
      }

      if (!data.success) {
        alert("Delete operation failed.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Delete item error:", error);
      alert("Something went wrong while deleting the item.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        alert("Unauthorized. Please login again.");
        return;
      }

      const res = await fetch("/api/admin/update-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          name,
          price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update item.");
        return;
      }

      if (!data.success) {
        alert("Update operation failed.");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Update item error:", error);
      alert("Something went wrong while updating the item.");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="premium-input px-4 py-2 text-sm text-slate-800"
          disabled={loading}
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="premium-input w-28 px-4 py-2 text-sm text-slate-800"
          disabled={loading}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="premium-button px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => setEditing(false)}
            className="premium-button-secondary px-4 py-2 text-sm font-semibold"
            disabled={loading}
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
        disabled={loading}
      >
        Edit
      </button>

      <button
        onClick={handleDelete}
        className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
        type="button"
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}