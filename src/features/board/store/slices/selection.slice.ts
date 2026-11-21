import type { DrawLine, Point } from "../../domain/types";
import type { StateCreator } from "zustand";
import type { BoardState } from "../board.store";

export type Selection =
  | { type: "shape"; id: string }
  | { type: "connection"; id: string }
  | { type: "codeblock"; id: string }
  | { type: "cloze"; id: string }
  | null;

export type MarqueeSelection = {
  items: ReadonlySet<string>;
  anchor: Point;
  lines: ReadonlySet<DrawLine>;
};

export const selectionKey = (type: Exclude<Selection, null>["type"], id: string) => `${type}:${id}`;

export type SelectionSlice = {
  selection: Selection;
  marqueeSelection: MarqueeSelection | null;
  moveMarquee: (delta: Point) => void;
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

export const createSelectionSlice: StateCreator<BoardState, [], [], SelectionSlice> =
  (set) => ({
    selection: null,
    marqueeSelection: null,

    moveMarquee: (delta) => set((state) => {
      const selected = state.marqueeSelection;
      if (!selected || (!delta.x && !delta.y)) return state;

      const translate = <T extends Point>(point: T): T => ({
        ...point,
        x: point.x + delta.x,
        y: point.y + delta.y,
      });
      const moveItems = <T extends Point & { id: string }>(
        items: T[],
        type: "shape" | "codeblock" | "cloze",
      ) => items.map((item) => selected.items.has(selectionKey(type, item.id)) ? translate(item) : item);

      const lines = new Set<DrawLine>();
      const nextLines = selected.lines.size ? state.lines.map((line) => {
        if (!selected.lines.has(line)) return line;

        const moved = { ...line, from: translate(line.from), to: translate(line.to) };
        lines.add(moved);
        return moved;
      }) : state.lines;

      return {
        shapes: moveItems(state.shapes, "shape"),
        codeBlocks: moveItems(state.codeBlocks, "codeblock"),
        clozeTests: moveItems(state.clozeTests, "cloze"),
        lines: nextLines,
        marqueeSelection: {
          ...selected,
          anchor: translate(selected.anchor),
          lines: selected.lines.size ? lines : selected.lines,
        },
      };
    }),

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
    startEditingClozeTest: (id) => set(() => ({ editingClozeTestId: id })),
    stopEditingClozeTest: () => set(() => ({ editingClozeTestId: null })),
  });