"use client";

import { useEffect } from "react";
import { useBoardStore } from "../store/board.store";

export function useDeleteSelected() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useBoardStore.getState();

      if (event.key === "Escape") {
        state.cancelConnecting();
        if (state.marqueeSelection) state.clearSelection();
        if (state.editingCodeBlockId) state.stopEditingCodeBlock();
        if (state.editingClozeTestId) state.stopEditingClozeTest();
        return;
      }

      if (event.defaultPrevented || (event.key !== "Delete" && event.key !== "Backspace")) return;
      const target = event.target;
      if (target instanceof HTMLElement &&
          (target.isContentEditable || target.closest("input, textarea, select, .cm-editor"))) return;

      if (state.deleteSelected()) event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
