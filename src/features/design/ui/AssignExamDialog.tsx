"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBoardStore } from "@/features/board/store/board.store";
import { capturePage } from "../domain/capturePage";

type AssignmentResult = { assigned: number; alreadyAssigned: number; unknownEmails: string[] };

export function AssignExamDialog({ reference, itemId, close }: { reference: string; itemId: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [emails, setEmails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AssignmentResult | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    return () => element.close();
  }, []);

  const assign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const recipients = [...new Set(emails.trim().split(/[\s,;]+/).filter(Boolean).map((email) => email.toLowerCase()))];
    if (!recipients.length) {
      setError("Enter at least one email address.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const opens = String(form.get("opensAt") ?? "");
    const closes = String(form.get("closesAt") ?? "");
    const duration = String(form.get("durationMinutes") ?? "");
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const timing = {
        opensAt: opens ? new Date(opens).toISOString() : undefined,
        closesAt: closes ? new Date(closes).toISOString() : undefined,
        durationMinutes: duration ? Number(duration) : undefined,
      };
      if (timing.opensAt && timing.closesAt && timing.opensAt >= timing.closesAt) {
        throw new Error("The closing date must be after the opening date.");
      }
      const board = useBoardStore.getState();
      const page = board.sheets.find((item) => item.id === itemId);
      if (!page) throw new Error("Page item not found.");
      const capture = capturePage(board, page);
      const response = await fetch("/api/exam/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, pageId: itemId, emails: recipients, timing, draft: { page: capture.page, changes: capture.snapshot.changes } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not assign the exam.");
      setResult(data);
      setEmails(data.unknownEmails.join("\n"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not assign the exam.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog ref={dialog} aria-labelledby="assign-exam-title"
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-auto rounded-2xl border border-stone-200 bg-white p-4 text-stone-900 shadow-xl backdrop:bg-black/35 sm:p-6"
      onCancel={(event) => { event.preventDefault(); if (!busy) close(); }}>
      <form className="grid gap-4" onSubmit={assign}>
        <h2 id="assign-exam-title" className="text-lg font-bold">Assign exam</h2>
        <label className="grid gap-2 text-sm font-medium">
          Student email addresses
          <textarea rows={4} value={emails} disabled={busy} onChange={(event) => setEmails(event.target.value)}
            placeholder="student@example.com" autoCapitalize="none" spellCheck={false}
            className="w-full resize-y rounded-lg border border-stone-300 p-2 font-normal focus:border-blue-600 focus:outline-none" />
        </label>
        <fieldset disabled={busy} className="grid gap-2 rounded-lg border border-stone-200 p-3 text-sm">
          <legend className="px-1 font-medium">Timing (optional)</legend>
          <label className="grid gap-1">Opens at
            <input type="datetime-local" name="opensAt" className="min-w-0 rounded-md border border-stone-300 p-2" />
          </label>
          <label className="grid gap-1">Closes at
            <input type="datetime-local" name="closesAt" className="min-w-0 rounded-md border border-stone-300 p-2" />
          </label>
          <label className="grid gap-1">Minutes from start
            <input type="number" name="durationMinutes" min={1} max={1440} step={1} className="min-w-0 rounded-md border border-stone-300 p-2" />
          </label>
          <p className="text-xs text-stone-600">Dates use your device’s time zone. The closing date can shorten the time available.</p>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {result && (
          <div role="status" className="grid gap-1 break-words text-sm text-stone-700">
            <p>{result.assigned} assigned. {result.alreadyAssigned} already assigned.</p>
            {result.unknownEmails.length > 0 && <p>No matching active account: {result.unknownEmails.join(", ")}</p>}
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" disabled={busy} onClick={close}
            className="min-h-10 rounded-lg border border-stone-200 px-4 text-sm font-medium">Close</button>
          <button type="submit" disabled={busy || !emails.trim()}
            className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Assigning…" : "Assign"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
