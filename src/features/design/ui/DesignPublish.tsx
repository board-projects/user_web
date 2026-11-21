import { useState } from "react";
import type { BoardSyncStatus } from "@/features/board/services/boardSocket";
import type { SheetLayout } from "../domain/sheetLayout";
import { designButton } from "./DesignControls";

export function DesignPublish({ reference, layout, status, waitForSync }: {
  reference: string; layout: SheetLayout;
  status: BoardSyncStatus; waitForSync: () => Promise<void>;
}) {
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const publish = async () => {
    setPublishing(true);
    setError("");
    setCopied(false);

    try {
      await waitForSync();
      const response = await fetch(`/api/boards/${encodeURIComponent(reference)}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      const data = await response.json();
      if (!response.ok || typeof data.reference !== "string") {
        throw new Error(typeof data.message === "string" ? data.message : "Unable to publish this page");
      }
      setResult(new URL(`/test/${encodeURIComponent(data.reference)}`, window.location.origin).href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to publish this page");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="min-h-10 rounded-lg bg-cyan-800 px-4 text-sm font-semibold text-white hover:bg-cyan-900 disabled:opacity-50"
        disabled={publishing || status !== "connected"}
        onClick={publish}
      >
        {publishing ? "Publishing…" : result ? "Publish updates" : "Publish"}
      </button>
      {status !== "connected" && <span role="status" className="text-xs text-cyan-900">
        {status === "offline" ? "Reconnecting to board…" : "Connecting to board…"}
      </span>}
      {result && (
        <>
          <a className={designButton} href={result} target="_blank" rel="noreferrer">Open test page</a>
          <button type="button" className={designButton} onClick={async () => {
            try {
              await navigator.clipboard.writeText(result);
              setCopied(true);
            } catch {
              setError("Copy is unavailable. Open the test page to copy its address.");
            }
          }}>{copied ? "Copied" : "Copy link"}</button>
        </>
      )}
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
    </div>
  );
}
