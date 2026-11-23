"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function SwitchAccountButton({ loginPath }: { loginPath: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const switchAccount = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      useAuthStore.getState().logout();
      window.location.replace(loginPath);
    } catch {
      setError("Unable to sign out. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={switchAccount} disabled={busy}
        className="min-h-10 rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 hover:bg-cyan-100 disabled:opacity-60">
        Switch account
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
