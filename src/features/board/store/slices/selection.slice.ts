import type { StateCreator } from "zustand";

export type Selection =
  | { type: "shape"; id: string }
  | { type: "codeblock"; id: string }
  | { type: "cloze"; id: string }
  | null;

export type SelectionSlice = {
  selection: Selection;
  select: (sel: Exclude<Selection, null>) => void;
  clearSelection: () => void;

  editingCodeBlockId: string | null;
  startEditingCodeBlock: (id: string) => void;
  stopEditingCodeBlock: () => void;
  
  editingClozeTestId: string | null;
  startEditingClozeTest: (id: string) => void;
  stopEditingClozeTest: () => void;
};

export const createSelectionSlice: StateCreator<any, [], [], SelectionSlice> =
  (set) => ({
    selection: null,

    select: (sel) =>
      set(() => ({
        selection: sel,
        editingCodeBlockId: null,
        editingClozeTestId: null,
      })),

    clearSelection: () =>
      set(() => ({
        selection: null,
        editingCodeBlockId: null,
        editingClozeTestId: null,
      })),

    editingCodeBlockId: null,
    startEditingCodeBlock: (id) => set(() => ({ editingCodeBlockId: id })),
    stopEditingCodeBlock: () => set(() => ({ editingCodeBlockId: null })),

    editingClozeTestId: null,
    startEditingClozeTest: (id) => set(() => ({ editingClozeId: id })),
    stopEditingClozeTest: () => set(() => ({ editingClozeId: null })),
  });