import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  label: string;
  value: string;
  maxLength: number;
  commit: (value: string) => void;
  close: () => void;
};

export function InlineItemTextEditor({ label, value, maxLength, commit, close }: Props) {
  const [draft, setDraft] = useState(value);
  const initialValue = useRef(value);
  const input = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);

  useLayoutEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  return (
    <textarea
      ref={input}
      aria-label={label}
      maxLength={maxLength}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (!cancelled.current && draft !== initialValue.current) commit(draft);
        close();
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
          event.preventDefault();
          event.stopPropagation();
          cancelled.current = event.key === "Escape";
          event.currentTarget.blur();
        }
      }}
      onClick={(event) => event.stopPropagation()}
      className="h-full w-full resize-none rounded-sm border border-blue-600 bg-white p-0.5 text-center text-xs leading-tight text-stone-900 outline-none"
    />
  );
}
