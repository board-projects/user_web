import type { BoardChange, BoardContent } from "../domain/boardSync";
import { prepareBoardImport, serializeBoardArchive } from "../domain/boardArchive";

export function downloadBoard(title: string, board: BoardContent) {
  const blob = new Blob([serializeBoardArchive(title, board)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const filename = title.trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "board";
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

async function validateBatch(changes: BoardChange[], signal: AbortSignal) {
  const response = await fetch("/api/boards/validate-import", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(typeof error?.message === "string" ? error.message : "Unable to validate this board JSON");
  }
}

export async function readBoardImport(file: File, signal: AbortSignal) {
  let archive: unknown;
  try {
    archive = JSON.parse(await file.text());
  } catch {
    throw new Error("This file is not valid JSON");
  }

  const changes = prepareBoardImport(archive);
  const encoder = new TextEncoder();
  let bytes = 0;
  let batch: BoardChange[] = [];
  for (const change of changes) {
    const size = encoder.encode(JSON.stringify(change)).byteLength;
    if (size > 1_000_000) throw new Error("An item in the file is too large to import");
    if (bytes + size > 1_000_000) {
      await validateBatch(batch, signal);
      batch = [];
      bytes = 0;
    }
    batch.push(change);
    bytes += size;
  }
  if (batch.length) await validateBatch(batch, signal);
  return changes;
}
