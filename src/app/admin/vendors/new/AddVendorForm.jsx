"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVendorAction } from "./actions";
import { ShieldAlert, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";

export default function AddVendorForm({ categories = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "Vendor@123",
    shop_name: "",
    category_id: categories.length > 0 ? String(categories[0].id) : "",
    avg_prep_time: "15",
  });

  const generatePassword = () => {
    // Generate a secure random password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, password: newPassword }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    const res = await createVendorAction(submitData);

    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Vendor created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/admin/vendors");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Toast Notifications inline */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Section 1: Owner Details */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Owner Details</h2>
          <p className="text-sm text-slate-500">Personal information for the vendor account.</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="premium-input w-full px-4 py-3 text-sm text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="vendor@example.com"
              className="premium-input w-full px-4 py-3 text-sm text-slate-800"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <button
                type="button"
                onClick={generatePassword}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 transition-colors hover:text-green-700 focus:outline-none"
              >
                <RefreshCw className="h-3 w-3" />
                Generate Password
              </button>
            </div>
            <input
              type="text"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="premium-input w-full px-4 py-3 text-sm text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Section 2: Shop Details */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Shop Details</h2>
          <p className="text-sm text-slate-500">Information about the vendor&#39;s storefront.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Shop Name</label>
            <input
              type="text"
              name="shop_name"
              required
              value={formData.shop_name}
              onChange={handleChange}
              placeholder="e.g. Subs & Salads Center"
              className="premium-input w-full px-4 py-3 text-sm text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            {categories.length > 0 ? (
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="premium-input w-full px-4 py-3 text-sm text-slate-800"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                No active categories. Create one first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Avg Prep Time (mins)</label>
            <input
              type="number"
              name="avg_prep_time"
              required
              min="1"
              value={formData.avg_prep_time}
              onChange={handleChange}
              placeholder="15"
              className="premium-input w-full px-4 py-3 text-sm text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Actions */}
      <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push("/admin/vendors")}
          disabled={loading}
          className="premium-button-secondary w-full px-6 py-3 text-sm font-semibold sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || categories.length === 0}
          className="premium-button inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Vendor"
          )}
        </button>
      </div>
    </form>
  );
}
