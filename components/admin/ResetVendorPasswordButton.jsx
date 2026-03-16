"use client";

import { useState } from "react";

export default function ResetVendorPasswordButton({ userId }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reset-vendor-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert("New Password: " + data.password);
    } catch (error) {
      alert("An error occurred while resetting the password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResetPassword}
      disabled={isLoading}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
    >
      {isLoading ? "Resetting..." : "Reset Password"}
    </button>
  );
}
