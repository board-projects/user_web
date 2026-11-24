"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import type { ExamAccess } from "./ExamEntry";

export function PublishedExam({ children, reference, submitted = false, access }: {
  children: ReactNode;
  reference?: string;
  submitted?: boolean;
  access?: ExamAccess;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const finished = submitted || completed;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const deadline = access?.deadline;
  const serverNow = access?.serverNow;
  const [remaining, setRemaining] = useState<number>();
  const expired = remaining === 0;

  useEffect(() => {
    if (finished || !deadline || !serverNow) return;
    const duration = Date.parse(deadline) - Date.parse(serverNow);
    const start = performance.now();
    const tick = () => setRemaining(Math.max(0, Math.ceil((duration - (performance.now() - start)) / 1000)));
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [deadline, finished, serverNow]);

  const timeLeft = remaining === undefined ? "" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const finish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || finished || expired) return;
    if (!reference) {
      setCompleted(true);
      return;
    }

    const selected = new Map<string, string[]>();
    for (const input of event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[data-question-id]:checked, input[data-cloze-blank], [data-question-answer]")) {
      if (input instanceof HTMLTextAreaElement && !input.value.trim()) continue;
      const id = input.dataset.questionId;
      if (id) selected.set(id, [...(selected.get(id) ?? []), input.value]);
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/exam/assignments/${encodeURIComponent(reference)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: Object.fromEntries(selected) }),
      });
      if (response.status === 401) {
        window.location.assign(`/login?next=${encodeURIComponent(`/test/${reference}`)}`);
        return;
      }
      if (response.status === 403) {
        setRemaining(0);
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error("Could not submit your answers. Please try again.");
      setCompleted(true);
      router.refresh();
    } catch {
      setError("Could not submit your answers. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={finish} onKeyDown={(event) => {
      if (event.key === "Enter" && event.target instanceof HTMLInputElement &&
          event.target.hasAttribute("data-cloze-blank")) event.preventDefault();
    }}>
      {!finished && remaining !== undefined && (
        <p className="border-b border-stone-200 px-4 py-2 text-sm font-medium tabular-nums">
          {expired ? "The exam deadline has passed." : `Time left: ${timeLeft}`}
        </p>
      )}
      <fieldset disabled={finished || busy || expired} className="m-0 min-w-0 border-0 p-0">
        {children}
      </fieldset>
      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 px-4 py-4">
        {error && <span role="alert" className="text-sm text-red-700">{error}</span>}
        <span role="status" className="text-sm font-medium text-stone-600">{finished && (reference ? "Exam submitted." : "Exam finished.")}</span>
        <button type="submit" disabled={finished || busy || expired}
          className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-stone-200 disabled:text-stone-700">
          {busy ? "Submitting…" : "Finish exam"}
        </button>
      </footer>
    </form>
  );
}
