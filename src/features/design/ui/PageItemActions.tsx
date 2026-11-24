"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBoardStore } from "@/features/board/store/board.store";
import { capturePage } from "../domain/capturePage";
import { applyBoardChanges, EMPTY_BOARD, type BoardUpdate } from "@/features/board/domain/boardSync";
import { propertyButtonClass } from "@/features/board/ui/properties/ItemPropertyControl";
import type { SheetLayout } from "../domain/sheetLayout";
import { AssignExamDialog } from "./AssignExamDialog";
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

export function PageItemActions({ reference, itemId, deleteButton }: { reference: string; itemId: string; deleteButton: ReactNode }) {
  const isPublic = useBoardStore((state) => state.sheets.find((page) => page.id === itemId)?.visibility === "public");
  const [notice, setNotice] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [print, setPrint] = useState<PrintPage | null>(null);
  const [error, setError] = useState("");
  const [fallbackPath, setFallbackPath] = useState("");
  const running = useRef(false);
  const closePrint = useCallback(() => setPrint(null), []);

  const run = async (action: "preview" | "publish") => {
    if (running.current) return;
    running.current = true;
    setError("");
    setNotice("");
    let publicTab: Window | null = null;
    try {
      const board = useBoardStore.getState();
      const page = board.sheets.find((item) => item.id === itemId);
      if (!page) throw new Error("Page item not found");
      const capture = capturePage(board, page);
      if (action === "preview") {
        setPrint(capture);
        return;
      }

      if (page.visibility === "public") publicTab = window.open("about:blank", "_blank");
      if (publicTab) publicTab.opener = null;

      setFallbackPath("");
      setPublishing(true);
      const response = await fetch(`/api/boards/${encodeURIComponent(reference)}/pages/${encodeURIComponent(itemId)}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: capture.page, changes: capture.snapshot.changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not publish the page");
      if (data.visibility === "private") {
        setNotice("Private access saved.");
        return;
      }
      if (typeof data.reference !== "string") throw new Error("Published link is unavailable");

      const path = `/test/${encodeURIComponent(data.reference)}`;
      if (publicTab && !publicTab.closed) {
        publicTab.location.replace(new URL(path, window.location.origin).href);
      } else {
        setFallbackPath(path);
      }
    } catch (cause) {
      publicTab?.close();
      setError(cause instanceof Error ? cause.message : "Page action failed");
    } finally {
      running.current = false;
      setPublishing(false);
    }
  };

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-1 sm:flex-nowrap sm:overflow-x-auto">
        <button type="button" className={propertyButtonClass} disabled={publishing} onClick={() => void run("preview")}>
          Export PDF
        </button>
        <button type="button" className={propertyButtonClass} disabled={publishing} onClick={() => void run("publish")}>
          {publishing ? "Saving…" : isPublic ? "Publish" : "Save private"}
        </button>
        {deleteButton}
      </div>
      <button type="button" className={propertyButtonClass} onClick={() => setAssigning(true)}>Assign</button>
      {isPublic && fallbackPath && (
        <a className={`${propertyButtonClass} inline-flex items-center`} href={fallbackPath} target="_blank" rel="noopener noreferrer">
          Published link
        </a>
      )}
      {notice && <span role="status" className="px-2 text-xs text-stone-700">{notice}</span>}
      {error && <span role="alert" className="shrink-0 px-2 text-xs text-red-700">{error}</span>}
      {assigning && <AssignExamDialog reference={reference} itemId={itemId} close={() => setAssigning(false)} />}
      {print && <PrintablePage page={print} close={closePrint} />}
    </>
  );
}
