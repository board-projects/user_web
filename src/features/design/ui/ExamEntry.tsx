"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type ExamAccess = {
  status: "scheduled" | "ready" | "open" | "closed";
  opensAt?: string;
  closesAt?: string;
  durationMinutes?: number;
  deadline?: string;
  serverNow: string;
};

export function ExamEntry({ reference, title, access }: { reference: string; title: string; access: ExamAccess }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [localOpening, setLocalOpening] = useState(access.opensAt);

  useEffect(() => {
    if (access.opensAt) setLocalOpening(new Date(access.opensAt).toLocaleString());
  }, [access.opensAt]);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/exam/assignments/${encodeURIComponent(reference)}/start`, { method: "POST" });
      if (response.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(`/test/${reference}`)}`);
        return;
      }
      if (response.ok || response.status === 403) {
        router.refresh();
        return;
      }
      setError("Could not start the exam. Please try again.");
    } catch {
      setError("Could not start the exam. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-lg gap-3 p-5">
      <h1 className="break-words text-lg font-semibold">{title}</h1>
      {access.status === "scheduled" && (
        <>
          <p>The exam opens at {localOpening}.</p>
          <button type="button" className="justify-self-start rounded-md border px-4 py-2" onClick={() => router.refresh()}>Check availability</button>
        </>
      )}
      {access.status === "closed" && <p>The exam deadline has passed.</p>}
      {access.status === "ready" && (
        <>
          <p>You have {access.durationMinutes} minutes after starting. Submit before the timer ends.</p>
          {access.closesAt && <p>The exam closing time may shorten your time.</p>}
          <button type="button" disabled={busy} className="justify-self-start rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50" onClick={() => void start()}>
            {busy ? "Starting…" : "Start exam"}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </main>
  );
}
