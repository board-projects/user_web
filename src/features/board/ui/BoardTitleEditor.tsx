"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TbCheck, TbPencil, TbX } from "react-icons/tb";

type Props = {
  title: string;
  canRename: boolean;
  rename: (name: string) => Promise<void>;
};

const buttonClass = "grid h-9 w-9 shrink-0 place-items-center rounded-md text-cyan-900 hover:bg-cyan-100 focus-visible:outline-2 disabled:opacity-50";

export function BoardTitleEditor({ title, canRename, rename }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const editing = draft !== null;

  useEffect(() => {
    if (!editing) return;
    input.current?.focus();
    input.current?.select();
  }, [editing]);

  const close = () => {
    setDraft(null);
    setError("");
    requestAnimationFrame(() => trigger.current?.focus());
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = draft?.trim();
    if (!next || saving) return;
    if (next === title) {
      close();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await rename(next);
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to rename the board");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-1 rounded-lg bg-white/90 px-2 shadow-sm">
        <h1 title={title} className="min-w-0 truncate py-1 text-sm font-semibold text-cyan-950 sm:text-base">{title}</h1>
        {canRename && (
          <button ref={trigger} type="button" className={buttonClass} aria-label="Rename board" title="Rename board"
            onClick={() => setDraft(title)}>
            <TbPencil aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <form className="relative flex min-w-0 items-center gap-0.5 rounded-lg border border-cyan-200 bg-white px-1 shadow-sm" onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || saving) return;
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
    >
      <input ref={input} type="text" required maxLength={80} value={draft ?? ""} disabled={saving}
        aria-label="Board name" className="h-9 w-36 min-w-0 rounded px-1.5 text-base text-cyan-950 outline-none focus:ring-2 focus:ring-cyan-500 sm:w-56"
        onChange={(event) => setDraft(event.target.value)} />
      <button type="submit" className={buttonClass} aria-label="Save board name" title="Save board name" disabled={saving || !draft?.trim()}>
        <TbCheck aria-hidden="true" />
      </button>
      <button type="button" className={buttonClass} aria-label="Cancel rename" title="Cancel rename" disabled={saving} onClick={close}>
        <TbX aria-hidden="true" />
      </button>
      {error && <p role="alert" className="absolute left-0 top-full mt-1 w-full rounded border border-red-200 bg-white p-2 text-xs text-red-700">{error}</p>}
    </form>
  );
}
