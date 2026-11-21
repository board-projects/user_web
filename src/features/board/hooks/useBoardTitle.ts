import { useEffect, useState } from "react";

type BoardTitle = { title: string; canRename: boolean };
const fallback: BoardTitle = { title: "Untitled board", canRename: false };

export function useBoardTitle(reference: string) {
  const [board, setBoard] = useState(fallback);
  const path = `/api/boards/${encodeURIComponent(reference)}/title`;

  useEffect(() => {
    const request = new AbortController();
    fetch(path, { signal: request.signal, cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      if (!request.signal.aborted && typeof data.title === "string") {
        setBoard({ title: data.title, canRename: data.canRename === true });
      }
    }).catch(() => {});
    return () => request.abort();
  }, [path]);

  const rename = async (title: string) => {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || typeof data?.title !== "string") {
      throw new Error(typeof data?.message === "string" ? data.message : "Unable to rename the board");
    }
    setBoard({ title: data.title, canRename: data.canRename === true });
  };

  return { ...board, rename };
}
