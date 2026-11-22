import { useLayoutEffect, useRef, useState } from "react";

import { contrastingTextColor, getTextStyles, type TextFormat } from "../domain/textFormat";

type Props = {
  format?: TextFormat;
  background?: string;
  label: string;
  value: string;
  maxLength: number;
  commit: (value: string) => void;
  close: () => void;
};

export function InlineItemTextEditor({ label, value, maxLength, commit, close, format, background }: Props) {
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
      dir="auto"
      style={{ ...getTextStyles(format), color: contrastingTextColor(background) }}
      className="h-full w-full resize-none rounded-sm border border-blue-600 bg-transparent p-0.5 text-xs leading-tight outline-none"
    />
  );
}
