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
  styleSelectedLines: (style: Partial<Pick<DrawLine, "color" | "size">>) => void;
  deleteSelected: () => boolean;
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

    styleSelectedLines: (style) => set((state) => {
      const selected = state.marqueeSelection;
      if (!selected?.lines.size) return state;

      const lines = new Set<DrawLine>();
      const updated = state.lines.map((line) => {
        if (!selected.lines.has(line)) return line;
        const next = { ...line, ...style };
        lines.add(next);
        return next;
      });
      return { lines: updated, marqueeSelection: { ...selected, lines } };
    }),

    deleteSelected: () => {
      let deleted = false;
      set((state) => {
        const selected = state.selection;
        const items = selected
          ? new Set([selectionKey(selected.type, selected.id)])
          : state.marqueeSelection?.items;
        const lines = selected ? undefined : state.marqueeSelection?.lines;
        if (!items?.size && !lines?.size) return state;
        deleted = true;

        const has = (type: Exclude<Selection, null>["type"], id: string) =>
          items?.has(selectionKey(type, id)) ?? false;
        const endpointDeleted = (id: string) => has("shape", id) || has("codeblock", id) || has("cloze", id);
        return {
          shapes: state.shapes.filter((shape) => !has("shape", shape.id)),
          codeBlocks: state.codeBlocks.filter((block) => !has("codeblock", block.id)),
          clozeTests: state.clozeTests.filter((cloze) => !has("cloze", cloze.id)),
          connections: state.connections.filter((connection) =>
            !has("connection", connection.id) &&
            !endpointDeleted(connection.sourceId) &&
            !endpointDeleted(connection.targetId),
          ),
          lines: lines?.size ? state.lines.filter((line) => !lines.has(line)) : state.lines,
          connectionDraft: null,
          selection: null,
          marqueeSelection: null,
          editingCodeBlockId: null,
          editingClozeTestId: null,
        };
      });
      return deleted;
    },

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