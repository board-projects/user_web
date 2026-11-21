import { drawingId, getDrawingFrame, scaleDrawingLine, translateDrawingLine, type DrawingFrame } from "../../domain/drawings";
import type { DrawLine, Point } from "../../domain/types";
import type { StateCreator } from "zustand";
import type { BoardState } from "../board.store";

export type Selection =
  | { type: "shape"; id: string }
  | { type: "connection"; id: string }
  | { type: "codeblock"; id: string }
  | { type: "cloze"; id: string }
  | { type: "page"; id: string }
  | { type: "table"; id: string }
  | null;

export type MarqueeSelection = {
  items: ReadonlySet<string>;
  anchor: Point;
  lines: ReadonlySet<DrawLine>;
};

export const selectionKey = (type: Exclude<Selection, null>["type"], id: string) => `${type}:${id}`;

export type MoveScope = { items: ReadonlySet<string>; lineIds: ReadonlySet<string> };

export type SelectionSlice = {
  selection: Selection;
  marqueeSelection: MarqueeSelection | null;
  styleSelectedLines: (style: Partial<Pick<DrawLine, "color" | "size">>) => void;
  deleteSelected: () => boolean;
  moveMarquee: (delta: Point, scope?: MoveScope) => void;
  selectDrawing: (id: string) => void;
  resizeDrawing: (from: DrawingFrame, to: DrawingFrame) => void;
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

    selectDrawing: (id) => set((state) => {
      const lines = state.lines.filter((line) => drawingId(line) === id);
      const anchor = getDrawingFrame(lines);
      if (!anchor || lines.every((line) => state.marqueeSelection?.lines.has(line))) return state;

      return {
        selection: null,
        marqueeSelection: { items: new Set(), lines: new Set(lines), anchor },
        editingCodeBlockId: null,
        editingClozeTestId: null,
      };
    }),

    resizeDrawing: (from, to) => set((state) => {
      const selected = state.marqueeSelection;
      if (!selected?.lines.size || selected.items.size ||
          (from.x === to.x && from.y === to.y && from.width === to.width && from.height === to.height)) return state;

      const lines = new Set<DrawLine>();
      const updated = state.lines.map((line) => {
        if (!selected.lines.has(line)) return line;
        const next = scaleDrawingLine(line, from, to);
        lines.add(next);
        return next;
      });
      return { lines: updated, marqueeSelection: { ...selected, anchor: to, lines } };
    }),

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
        const endpointDeleted = (id: string) => has("shape", id) || has("codeblock", id) || has("cloze", id) || has("page", id) || has("table", id);
        return {
          shapes: state.shapes.filter((shape) => !has("shape", shape.id)),
          codeBlocks: state.codeBlocks.filter((block) => !has("codeblock", block.id)),
          clozeTests: state.clozeTests.filter((cloze) => !has("cloze", cloze.id)),
          tables: state.tables.filter((table) => !has("table", table.id)),
          sheets: state.sheets.filter((page) => !has("page", page.id)),
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

    moveMarquee: (delta, scope) => set((state) => {
      const selected = state.marqueeSelection;
      if ((!selected && !scope) || (!delta.x && !delta.y)) return state;

      const items = scope?.items ?? selected?.items;
      const shouldMoveLine = (line: DrawLine) => scope ? scope.lineIds.has(line.id) : selected?.lines.has(line);

      const translate = <T extends Point>(point: T): T => ({
        ...point,
        x: point.x + delta.x,
        y: point.y + delta.y,
      });
      const moveItems = <T extends Point & { id: string }>(
        collection: T[],
        type: "shape" | "codeblock" | "cloze" | "page" | "table",
      ) => {
        const next = collection.map((item) => items?.has(selectionKey(type, item.id)) ? translate(item) : item);
        return next.some((item, index) => item !== collection[index]) ? next : collection;
      };

      const selectedLines = new Set<DrawLine>();
      const movesLines = scope ? scope.lineIds.size > 0 : !!selected?.lines.size;
      const nextLines = movesLines ? state.lines.map((line) => {
        const moved = shouldMoveLine(line) ? translateDrawingLine(line, delta) : line;
        if (selected?.lines.has(line)) selectedLines.add(moved);
        return moved;
      }) : state.lines;

      return {
        shapes: moveItems(state.shapes, "shape"),
        codeBlocks: moveItems(state.codeBlocks, "codeblock"),
        clozeTests: moveItems(state.clozeTests, "cloze"),
        tables: moveItems(state.tables, "table"),
        sheets: moveItems(state.sheets, "page"),
        lines: nextLines,
        marqueeSelection: selected ? {
          ...selected,
          anchor: translate(selected.anchor),
          lines: movesLines ? selectedLines : selected.lines,
        } : null,
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