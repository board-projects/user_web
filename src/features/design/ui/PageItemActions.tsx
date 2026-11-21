"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBoardStore } from "@/features/board/store/board.store";
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

export function PageItemActions({ itemId }: { itemId: string }) {
  const [publishing, setPublishing] = useState(false);
  const [print, setPrint] = useState<PrintPage | null>(null);
  const [error, setError] = useState("");
  const running = useRef(false);
  const closePrint = useCallback(() => setPrint(null), []);

  const run = async (action: "preview" | "publish") => {
    if (running.current) return;
    running.current = true;
    setError("");
    try {
      const board = useBoardStore.getState();
      const page = board.sheets.find((item) => item.id === itemId);
      if (!page) throw new Error("Page item not found");
      const capture = capturePage(board, page);
      if (action === "preview") {
        setPrint(capture);
        return;
      }

      setPublishing(true);
      const response = await fetch("/api/test/publications", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: capture.page, changes: capture.snapshot.changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Could not publish the page");
      if (typeof data.reference !== "string") throw new Error("Published link is unavailable");

      window.location.assign(`/test/${encodeURIComponent(data.reference)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Page action failed");
    } finally {
      running.current = false;
      setPublishing(false);
    }
  };

  return (
    <>
      <button type="button" className={propertyButtonClass} disabled={publishing} onClick={() => void run("preview")}>
        Export PDF
      </button>
      <button type="button" className={propertyButtonClass} disabled={publishing} onClick={() => void run("publish")}>
        {publishing ? "Publishing…" : "Publish"}
      </button>
      {error && <span role="alert" className="shrink-0 px-2 text-xs text-red-700">{error}</span>}
      {print && <PrintablePage page={print} close={closePrint} />}
    </>
  );
}
