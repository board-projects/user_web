"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBoardStore } from "@/features/board/store/board.store";
import { openPublishSignInChannel, PUBLISH_RESUME_PARAM } from "@/features/auth/services/publishSignIn";
import { capturePage } from "../domain/capturePage";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import { propertyButtonClass } from "@/features/board/ui/properties/ItemPropertyControl";
import type { SheetLayout } from "../domain/sheetLayout";
import { DesignSheet } from "./DesignSheet";

type PrintPage = { title: string; layout: SheetLayout; snapshot: BoardUpdate };

function PrintablePage({ page, close }: { page: PrintPage; close: () => void }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.print());
    window.addEventListener("afterprint", close);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", close);
    };
  }, [close]);

  return createPortal(
    <div id="board-page-print" className="hidden print:block" style={{ width: page.layout.width }}>
      <style>{`@media print {
        @page { size: ${page.layout.width}px ${page.layout.height}px; margin: 0; }
        body > :not(#board-page-print) { display: none !important; }
        #board-page-print { display: block !important; print-color-adjust: exact; }
      }`}</style>
      <DesignSheet title={page.title} layout={page.layout} board={applyBoardChanges(EMPTY_BOARD, page.snapshot.changes)} />
    </div>,
    document.body,
  );
}

export function PageItemActions({ reference, itemId }: {
  reference: string; itemId: string;
}) {
  const [pending, setPending] = useState<"preview" | "publish" | null>(null);
  const [print, setPrint] = useState<PrintPage | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const resumeDraft = useRef<string | null>(null);
  const running = useRef(false);
  const [copied, setCopied] = useState(false);
  const closePrint = useCallback(() => setPrint(null), []);

  const run = useCallback(async (action: "preview" | "publish", savedDraft?: string) => {
    if (running.current) return;
    running.current = true;
    setPending(action);
    setError("");
    setResumeId(null);
    setCopied(false);
    try {
      let payload = savedDraft;
      if (!payload) {
        const board = useBoardStore.getState();
        const page = board.sheets.find((item) => item.id === itemId);
        if (!page) throw new Error("Page item not found");
        const capture = capturePage(board, page);
        if (action === "preview") {
          setPrint(capture);
          return;
        }
        payload = JSON.stringify({ page: capture.page, changes: capture.snapshot.changes });
      }
      const response = await fetch(`/api/boards/${encodeURIComponent(reference)}/pages/${encodeURIComponent(itemId)}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (response.status === 401) {
        if (savedDraft) throw new Error("Publish could not verify the renewed session. Try Publish again in this tab.");
        resumeDraft.current = payload;
        setResumeId(crypto.randomUUID());
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Page action failed");
      if (typeof data.reference === "string") setLink(new URL(`/test/${encodeURIComponent(data.reference)}`, window.location.origin).href);
      else throw new Error("Published link is unavailable");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Page action failed");
    } finally {
      running.current = false;
      setPending(null);
    }
  }, [reference, itemId]);

  useEffect(() => {
    if (!resumeId) return;
    const channel = openPublishSignInChannel(resumeId);
    if (!channel) return;

    channel.onmessage = (event) => {
      if (event.data !== "signed-in" || !resumeDraft.current) return;
      const draft = resumeDraft.current;
      resumeDraft.current = null;
      void run("publish", draft);
    };

    return () => channel.close();
  }, [resumeId, run]);

  return (
    <>
      <button type="button" className={propertyButtonClass} disabled={!!pending} onClick={() => void run("preview")}>
        {pending === "preview" ? "Preparing…" : "Export PDF"}
      </button>
      <button type="button" className={propertyButtonClass} disabled={!!pending} onClick={() => void run("publish")}>
        {pending === "publish" ? "Publishing…" : link ? "Publish updates" : "Publish"}
      </button>
      {link && (
        <>
          <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-stone-700">
            Public link
            <input
              type="url"
              value={link}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              className="h-9 w-48 rounded-md border border-stone-300 bg-white px-2 text-sm text-stone-900 sm:w-64"
            />
          </label>
          <a className={`${propertyButtonClass} inline-flex items-center`} href={link} target="_blank" rel="noreferrer">Open public page</a>
          <button type="button" className={propertyButtonClass} onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
            } catch {
              setError("Select the public link to copy it manually.");
            }
          }}>{copied ? "Copied" : "Copy public link"}</button>
        </>
      )}
      {resumeId && (
        <>
          <span role="status" className="shrink-0 px-2 text-xs text-stone-700">Sign in to continue publishing.</span>
          <a className={`${propertyButtonClass} inline-flex items-center`}
            href={`/login?${PUBLISH_RESUME_PARAM}=${encodeURIComponent(resumeId)}`}
            target="_blank" rel="noopener noreferrer">
            Sign in
          </a>
        </>
      )}
      {error && <span role="alert" className="shrink-0 px-2 text-xs text-red-700">{error}</span>}
      {print && <PrintablePage page={print} close={closePrint} />}
    </>
  );
}
