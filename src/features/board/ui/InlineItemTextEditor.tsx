import { useEffect, useLayoutEffect, useRef } from "react";
import { applyTextFormat, paragraphRange, updateTextRuns, type TextRange, type TextRun } from "../domain/richText";
import { contrastingTextColor, type TextFormat } from "../domain/textFormat";
import type { ShapeType } from "../domain/types";
import { shapeTextClip } from "./shapeTextLayout";
import { useTextEditingStore } from "../store/textEditing.store";
import { readTextSelection, renderEditableText, restoreTextSelection } from "./richTextDom";

type Props = {
  itemId: string;
  shape?: ShapeType;
  label: string;
  value: string;
  runs?: TextRun[];
  maxLength?: number;
  formatWholeText?: boolean;
  format?: TextFormat;
  background?: string;
  commit: (value: string, runs: TextRun[]) => void;
  close: () => void;
};

export function InlineItemTextEditor({ itemId, shape, label, value, runs, maxLength, formatWholeText = false, format, background, commit, close }: Props) {
  const input = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ commit, close });
  const draft = useRef({ text: value, runs: runs ?? [] });
  const range = useRef<TextRange>({ start: 0, end: value.length });
  const editing = useRef(false);
  const dirty = useRef(false);
  const pending = useRef<TextFormat>({});

  useLayoutEffect(() => {
    callbacks.current = { commit, close };
  });

  useLayoutEffect(() => {
    const root = input.current;
    if (!root) return;
    editing.current = true;
    renderEditableText(root, draft.current.text, draft.current.runs, format);
    restoreTextSelection(root, range.current);
  }, [itemId, format]);

  useEffect(() => {
    const root = input.current;
    if (!root) return;
    const publishSelection = () => {
      const selection = readTextSelection(root);
      if (!selection) return;
      range.current = selection;
      const existing = draft.current.runs.find((run) => run.start <= selection.start && run.end > selection.start);
      useTextEditingStore.setState({ editor: { itemId, format: { ...format, ...existing?.format, ...pending.current }, apply } });
    };

    function apply(patch: TextFormat) {
      const { text, runs: current } = draft.current;
      const selection = range.current;
      const target = patch.align ? paragraphRange(text, selection)
        : selection.start === selection.end && formatWholeText ? { start: 0, end: text.length } : selection;
      if (target.start === target.end) pending.current = { ...pending.current, ...patch };
      else {
        draft.current.runs = applyTextFormat(text, current, target, patch);
        dirty.current = true;
      }

      const colorPickerFocused = "color" in patch &&
        document.activeElement?.matches('[data-inline-text-tools] input[type="color"]');
      if ("link" in patch || colorPickerFocused) {
        if (colorPickerFocused && root) renderEditableText(root, text, draft.current.runs, format);
        const editor = useTextEditingStore.getState().editor;
        if (editor?.itemId === itemId) useTextEditingStore.setState({ editor: { ...editor, format: { ...editor.format, ...patch } } });
        return;
      }
      if (!root) return;
      renderEditableText(root, text, draft.current.runs, format);
      restoreTextSelection(root, selection);
      publishSelection();
    }

    const finishOutside = (event: Event) => {
      if (!(event.target instanceof Element) || root.contains(event.target) || event.target.closest("[data-inline-text-tools]")) return;
      finish();
    };

    publishSelection();
    document.addEventListener("selectionchange", publishSelection);
    document.addEventListener("pointerdown", finishOutside, true);
    document.addEventListener("focusin", finishOutside);
    return () => {
      document.removeEventListener("selectionchange", publishSelection);
      document.removeEventListener("pointerdown", finishOutside, true);
      document.removeEventListener("focusin", finishOutside);
      if (useTextEditingStore.getState().editor?.itemId === itemId) useTextEditingStore.setState({ editor: null });
    };
  }, [itemId, format, formatWholeText]);

  function finish(cancel = false) {
    if (!editing.current) return;
    editing.current = false;
    if (!cancel && dirty.current) {
      callbacks.current.commit(draft.current.text, draft.current.runs);
    }
    callbacks.current.close();
  }

  const insert = (content: string) => {
    const root = input.current;
    if (!root) return;
    const selection = readTextSelection(root) ?? range.current;
    const old = draft.current.text;
    const allowed = maxLength === undefined ? content : content.slice(0, Math.max(0, maxLength - old.length + selection.end - selection.start));
    const text = old.slice(0, selection.start) + allowed + old.slice(selection.end);
    if (text !== old) dirty.current = true;
    draft.current = { text, runs: updateTextRuns(old, text, draft.current.runs) };
    const caret = selection.start + allowed.length;
    renderEditableText(root, text, draft.current.runs, format);
    restoreTextSelection(root, { start: caret, end: caret });
  };

  return (
    <div
      ref={input}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      dir="auto"
      onInput={(event) => {
        const next = event.currentTarget.textContent ?? "";
        const text = maxLength === undefined ? next : next.slice(0, maxLength);
        const previous = draft.current.text;
        if (text !== previous) dirty.current = true;
        let runs = updateTextRuns(previous, text, draft.current.runs);
        const typed = text.length - previous.length;
        const caret = readTextSelection(event.currentTarget)?.end;
        const applyPending = typed > 0 && caret !== undefined && Object.keys(pending.current).length > 0;
        if (applyPending) runs = applyTextFormat(text, runs, { start: caret - typed, end: caret }, pending.current);
        draft.current = { text, runs };
        if (!(event.nativeEvent instanceof InputEvent && event.nativeEvent.isComposing) && (applyPending || next !== text)) {
          renderEditableText(event.currentTarget, text, draft.current.runs, format);
          const offset = Math.min(caret ?? text.length, text.length);
          restoreTextSelection(event.currentTarget, { start: offset, end: offset });
        }
      }}
      onPaste={(event) => {
        event.preventDefault();
        insert(event.clipboardData.getData("text").replace(/\r\n?/g, "\n"));
      }}
      onDrop={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key !== "Escape" && event.key !== "Enter") return;
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "Enter" && event.shiftKey) insert("\n");
        else finish(event.key === "Escape");
      }}
      onClick={(event) => event.stopPropagation()}
      style={{ color: contrastingTextColor(background), clipPath: shapeTextClip(shape) }}
      className="relative z-10 h-full w-full overflow-auto break-words bg-transparent p-1 text-xs leading-tight outline-none ring-1 ring-inset ring-blue-600"
    />
  );
}
