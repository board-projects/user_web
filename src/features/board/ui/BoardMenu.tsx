"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { TbDashboard, TbDownload, TbLink, TbLogout, TbMenu2, TbUpload } from "react-icons/tb";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useBoardTitle } from "../hooks/useBoardTitle";
import { BoardTitleEditor } from "./BoardTitleEditor";
import { applyBoardChanges } from "../domain/boardSync";
import { downloadBoard, readBoardImport } from "../services/boardFiles";
import type { BoardSyncStatus } from "../services/boardSocket";
import { useBoardStore } from "../store/board.store";

const menuItem = "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-cyan-950 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-cyan-600 disabled:opacity-50";

export function BoardMenu({ reference, status }: { reference: string; status: BoardSyncStatus }) {
  const boardTitle = useBoardTitle(reference);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const menu = useRef<HTMLDetailsElement | null>(null);
  const importRequest = useRef<AbortController | null>(null);
  const filePicker = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menu.current?.open && event.target instanceof Node && !menu.current.contains(event.target)) {
        menu.current.open = false;
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      importRequest.current?.abort();
    };
  }, []);

  const resetMessage = () => {
    setNotice("");
    setError("");
  };

  const invite = async () => {
    resetMessage();
    try {
      const url = new URL(`/board/${encodeURIComponent(reference)}`, window.location.origin);
      await navigator.clipboard.writeText(url.href);
      setNotice("Invite link copied");
    } catch {
      setError("Copy is unavailable. You can copy the board URL from the address bar.");
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    resetMessage();
    importRequest.current?.abort();
    const request = new AbortController();
    importRequest.current = request;
    setBusy(true);
    try {
      const changes = await readBoardImport(file, request.signal);
      if (request.signal.aborted) return;
      useBoardStore.setState((state) => applyBoardChanges(state, changes));
      setNotice(changes.length ? "Board items imported" : "This file contains no items");
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to import the board");
    } finally {
      if (importRequest.current === request) {
        importRequest.current = null;
        if (!request.signal.aborted) setBusy(false);
      }
    }
  };

  const logout = async () => {
    resetMessage();
    setBusy(true);
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to sign out. Please retry.");
      useAuthStore.getState().logout();
      window.location.replace("/login");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out");
      setBusy(false);
    }
  };

  return (
    <div data-ui="true" className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[65] max-w-[calc(100%-5rem)]">
      <div className="flex min-w-0 items-center gap-2">
        <details
          ref={menu}
          className="relative shrink-0"
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !event.currentTarget.open) return;
            event.stopPropagation();
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }}
        >
          <summary aria-label="Board menu" className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-cyan-200 bg-white text-xl text-cyan-900 shadow-sm hover:bg-cyan-50 [&::-webkit-details-marker]:hidden">
            <TbMenu2 aria-hidden="true" />
          </summary>
          <div className="absolute left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-cyan-100 bg-white p-1.5 shadow-lg">
            <Link href="/dashboard" className={menuItem}><TbDashboard aria-hidden="true" />Dashboard</Link>
            <button type="button" className={menuItem} onClick={() => void invite()}><TbLink aria-hidden="true" />Invite</button>
            <button type="button" className={menuItem} onClick={() => {
              resetMessage();
              downloadBoard(boardTitle.title, useBoardStore.getState());
            }}><TbDownload aria-hidden="true" />Export board (JSON)</button>
            <button type="button" className={menuItem} disabled={busy} onClick={() => filePicker.current?.click()}>
              <TbUpload aria-hidden="true" />Import JSON
            </button>
            <input ref={filePicker} type="file" accept=".json,application/json" className="hidden" onChange={(event) => void importFile(event)} />
            <div className="my-1 border-t border-cyan-100" />
            <button type="button" className={menuItem} disabled={busy} onClick={() => void logout()}><TbLogout aria-hidden="true" />Logout</button>
            {notice && <p role="status" className="px-3 py-2 text-xs text-cyan-800">{notice}</p>}
            {error && <p role="alert" className="px-3 py-2 text-xs text-red-700">{error}</p>}
          </div>
        </details>
        <BoardTitleEditor {...boardTitle} />
      </div>
      {status !== "connected" && (
        <p role="status" className="mt-1.5 w-fit rounded-md bg-stone-900 px-3 py-2 text-xs text-white">
          {status === "offline" ? "Board sync offline. Reconnecting…" : "Connecting to board…"}
        </p>
      )}
    </div>
  );
}
