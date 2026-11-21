"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TbArrowUpRight, TbPlus, TbShape } from "react-icons/tb";
import { boardPath, createBoard, listBoards, type BoardSummary } from "../services/boardDirectory";

const formatDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function BoardDirectory() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [title, setTitle] = useState("");
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    listBoards(request.signal).then(
      (result) => { if (!request.signal.aborted) setBoards(result); },
      (error: Error) => { if (!request.signal.aborted) setLoadError(error.message); },
    );
    return () => request.abort();
  }, [attempt]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating || !title.trim()) return;

    setCreating(true);
    setCreateError("");
    try {
      const board = await createBoard(title.trim());
      router.push(boardPath(board.reference));
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create the board");
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="board-title" className="mb-2 block text-sm font-semibold text-cyan-950">Board name</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="board-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={80}
            placeholder="e.g. Monday’s lesson"
            className="min-w-0 flex-1 rounded-xl border border-cyan-200 px-4 py-3 text-base text-cyan-950 outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-cyan-900 disabled:opacity-50"
          >
            <TbPlus aria-hidden="true" />
            {creating ? "Creating…" : "Create board"}
          </button>
        </div>
        {createError && <p role="alert" className="mt-3 text-sm text-red-700">{createError}</p>}
      </form>

      {loadError ? (
        <div role="alert" className="rounded-2xl border border-cyan-100 bg-white p-5 text-cyan-950">
          <p>{loadError}</p>
          <button type="button" className="mt-2 min-h-10 font-semibold underline" onClick={() => {
            setLoadError("");
            setAttempt((value) => value + 1);
          }}>Try again</button>
        </div>
      ) : boards === null ? (
        <p role="status" className="text-cyan-900">Loading your boards…</p>
      ) : !boards.length ? (
        <p className="rounded-2xl border border-dashed border-cyan-200 px-5 py-8 text-center text-cyan-900">
          Create your first board to see it here.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.reference} className="min-w-0">
              <Link
                href={boardPath(board.reference)}
                prefetch={false}
                className="group flex h-full items-start gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm transition-colors hover:border-cyan-500 focus-visible:outline-2 focus-visible:outline-cyan-700"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-900">
                  <TbShape aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-bold text-cyan-950">{board.title}</span>
                  <time dateTime={board.createdAt} className="mt-1 block text-sm text-cyan-800">
                    {formatDate.format(new Date(board.createdAt))}
                  </time>
                </span>
                <TbArrowUpRight aria-hidden="true" className="mt-1 shrink-0 text-cyan-700" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
