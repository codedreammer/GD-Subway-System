"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

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
      className="premium-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
    >
      <KeyRound className="h-4 w-4" />
      {isLoading ? "Resetting..." : "Reset password"}
    </button>
  );
}
