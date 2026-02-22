"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/features/board/store/board.store";

export function useDeleteSelected() {
  const selection = useBoardStore((s) => s.selection);
  const clearSelection = useBoardStore((s) => s.clearSelection);

  const removeShape = useBoardStore((s) => s.removeShape);
  const removeCodeBlock = useBoardStore((s) => s.removeCodeBlock);

  const editingCodeBlockId = useBoardStore((s) => s.editingCodeBlockId);
  const stopEditingCodeBlock = useBoardStore((s) => s.stopEditingCodeBlock);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ✅ ESC => خروج از ادیت مود
      if (e.key === "Escape") {
        if (editingCodeBlockId) stopEditingCodeBlock();
        return;
      }

      if (e.key !== "Delete" && e.key !== "Backspace") return;

      const target = e.target as HTMLElement | null;

      // اگر داخل input/textarea/contentEditable هستیم، حذف آیتم انجام نشه
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || (target as any).isContentEditable) return;

        // ✅ فقط وقتی داخل CodeMirror هستیم و همان کدبلاک در حالت ادیت است، حذف آیتم انجام نشه
        const insideCodeMirror = !!target.closest(".cm-editor");
        const isEditingThisCodeBlock =
          selection?.type === "codeblock" && editingCodeBlockId === selection.id;

        if (insideCodeMirror && isEditingThisCodeBlock) return;
      }

      if (!selection) return;

      e.preventDefault();

      if (selection.type === "shape") removeShape(selection.id);
      if (selection.type === "codeblock") removeCodeBlock(selection.id);

      clearSelection();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selection,
    editingCodeBlockId,
    stopEditingCodeBlock,
    removeShape,
    removeCodeBlock,
    clearSelection,
  ]);
}