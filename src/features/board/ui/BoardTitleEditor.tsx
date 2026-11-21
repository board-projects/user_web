"use client";

import { useRef, useState } from "react";

type Props = {
  title: string;
  canRename: boolean;
  rename: (name: string) => Promise<void>;
};

const titleClass = "min-w-0 rounded-lg bg-white/90 px-2 py-1 text-sm font-semibold text-cyan-950 shadow-sm sm:text-base";

export function BoardTitleEditor({ title, canRename, rename }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const cancelled = useRef(false);

  const save = async (value: string) => {
    const next = value.trim();
    if (cancelled.current || !next || next === title) {
      setDraft(null);
      return;
    }

    setSaving(true);
    try {
      await rename(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to rename the board");
    } finally {
      setDraft(null);
      setSaving(false);
    }
  };

  if (!canRename) return <h1 className={`${titleClass} truncate`} title={title}>{title}</h1>;

  return (
    <div className="relative min-w-0">
      <input
        type="text"
        aria-label="Board name"
        aria-busy={saving}
        title="Click to rename board"
        maxLength={80}
        value={draft ?? title}
        readOnly={saving}
        className={`${titleClass} w-36 cursor-text truncate border border-transparent outline-none hover:border-cyan-200 focus:border-cyan-500 focus:bg-white sm:w-56`}
        onFocus={() => {
          cancelled.current = false;
          setError("");
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => { if (!saving) void save(event.currentTarget.value); }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || (event.key !== "Enter" && event.key !== "Escape")) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Escape") cancelled.current = true;
          event.currentTarget.blur();
        }}
      />
      {error && <p role="alert" className="absolute left-0 top-full mt-1 w-full rounded border border-red-200 bg-white p-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
