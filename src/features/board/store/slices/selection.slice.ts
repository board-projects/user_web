import type { DrawLine } from "../../domain/types";
import type { StateCreator } from "zustand";

export type Selection =
  | { type: "shape"; id: string }
  | { type: "connection"; id: string }
  | { type: "codeblock"; id: string }
  | { type: "cloze"; id: string }
  | null;

export type MarqueeSelection = {
  items: ReadonlySet<string>;
  lines: ReadonlySet<DrawLine>;
};

export const selectionKey = (type: Exclude<Selection, null>["type"], id: string) => `${type}:${id}`;

export type SelectionSlice = {
  selection: Selection;
  marqueeSelection: MarqueeSelection | null;
  selectMarquee: (selection: MarqueeSelection) => void;
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
    marqueeSelection: null,

    selectMarquee: (marqueeSelection) => set({
      selection: null,
      marqueeSelection,
      editingCodeBlockId: null,
      editingClozeTestId: null,
    }),

    select: (sel) =>
      set(() => ({
        selection: sel,
        marqueeSelection: null,
        editingCodeBlockId: null,
        editingClozeTestId: null,
      })),

    clearSelection: () =>
      set(() => ({
        selection: null,
        marqueeSelection: null,
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