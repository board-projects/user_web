import { TABLE_LIMITS } from "../../domain/tables";
import { CONNECTOR_PATTERNS, CONNECTOR_ROUTES, PAGE_UNITS } from "../../domain/types";
import { clozeConnectable } from "../../domain/connectableItems";
import { SHEET_LIMITS, SHEET_PRESETS } from "@/features/design/domain/sheetLayout";
import type { BoardState } from "../../store/board.store";
import type { Selection } from "../../store/slices/selection.slice";

export type ItemProperty =
  | { kind: "number"; label: string; value: number; min: number; max: number; change: (value: number) => void }
  | { kind: "color" | "text"; label: string; value: string; change: (value: string) => void }
  | { kind: "select"; label: string; value: string; options: readonly string[]; change: (value: string) => void }
  | { kind: "toggle"; label: string; value: boolean; change: (value: boolean) => void }
  | { kind: "action"; label: string; run: () => void };

type ItemProperties = {
  fields: ItemProperty[];
};

export function getSelectedBoardItem(state: BoardState, selection: Selection) {
  switch (selection?.type) {
    case "shape": return state.shapes.find((item) => item.id === selection.id);
    case "codeblock": return state.codeBlocks.find((item) => item.id === selection.id);
    case "table": return state.tables.find((item) => item.id === selection.id);
    case "page": return state.sheets.find((item) => item.id === selection.id);
    case "cloze": return state.clozeTests.find((item) => item.id === selection.id);
    case "connection": return state.connections.find((item) => item.id === selection.id);
  }
}

function sizeFields(
  { width, height }: { width: number; height: number },
  resize: (size: { width?: number; height?: number }) => void,
  minWidth: number,
  minHeight: number,
  square = false,
  max = 4000,
): ItemProperty[] {
  const widthField: ItemProperty = {
    kind: "number", label: square ? "Size" : "Width", value: width, min: minWidth, max,
    change: (value) => resize(square ? { width: value, height: value } : { width: value }),
  };
  if (square) return [widthField];

  return [widthField, {
    kind: "number", label: "Height", value: height, min: minHeight, max,
    change: (value) => resize({ height: value }),
  }];
}

const colorField = (value: string, change: (value: string) => void): ItemProperty =>
  ({ kind: "color", label: "Color", value, change });

const thicknessField = (value: number, max: number, change: (value: number) => void): ItemProperty =>
  ({ kind: "number", label: "Line width", value, min: 1, max, change });

export function getItemProperties(state: BoardState): ItemProperties | null {
  const selection = state.selection;
  if (!selection) {
    const drawing = state.marqueeSelection?.lines.values().next().value;
    if (!drawing || state.marqueeSelection?.items.size) return null;
    return {
      fields: [
        colorField(drawing.color, (color) => state.styleSelectedLines({ color })),
        thicknessField(drawing.size, 256, (size) => state.styleSelectedLines({ size })),
      ],
    };
  }

  const id = selection.id;
  switch (selection.type) {
    case "shape": {
      const item = state.shapes.find((shape) => shape.id === id);
      if (!item) return null;
      return {
        fields: [
          colorField(item.color, (color) => state.updateShape(id, { color })),
          ...sizeFields(item, (size) => state.updateShape(id, size), 10, 10, item.type !== "rect"),
        ],
      };
    }
    case "codeblock": {
      const item = state.codeBlocks.find((block) => block.id === id);
      if (!item) return null;
      return {
        fields: [
          ...sizeFields(item, (size) => state.updateCodeBlock(id, size), 200, 100),
          { kind: "action", label: "Edit code", run: () => state.startEditingCodeBlock(id) },
        ],
      };
    }
    case "cloze": {
      const item = state.clozeTests.find((block) => block.id === id);
      if (!item) return null;
      return {
        fields: [
          { kind: "text", label: "Title", value: item.title, change: (title) => state.updateClozeTest(id, { title }) },
          ...sizeFields(clozeConnectable(item), (size) => state.updateClozeTest(id, size), 140, 100),
          { kind: "action", label: "Edit content", run: () => state.startEditingClozeTest(id) },
        ],
      };
    }
    case "table": {
      const table = state.tables.find((item) => item.id === id);
      if (!table) return null;
      return {
        fields: [
          ...sizeFields(table, (size) => state.resizeTable(id, size),
            table.columns.length * TABLE_LIMITS.minTrack, table.rows.length * TABLE_LIMITS.minTrack, false, TABLE_LIMITS.maxSize),
          ...(table.rows.length < TABLE_LIMITS.tracks ? [{ kind: "action" as const, label: "Add row", run: () => state.addTableTrack(id, "rows") }] : []),
          ...(table.columns.length < TABLE_LIMITS.tracks ? [{ kind: "action" as const, label: "Add column", run: () => state.addTableTrack(id, "columns") }] : []),
        ],
      };
    }
    case "page": {
      const page = state.sheets.find((item) => item.id === id);
      if (!page) return null;
      const resolution = `${page.width} × ${page.height}`;
      const presets = SHEET_PRESETS.map(({ width, height }) => `${width} × ${height}`);

      return {
        fields: [
          { kind: "text", label: "Name", value: page.title, change: (title) => state.updatePage(id, { title }) },
          { kind: "color", label: "Background", value: page.backgroundColor ?? "#ffffff", change: (backgroundColor) => state.updatePage(id, { backgroundColor }) },
          {
            kind: "select", label: "Resolution", value: presets.includes(resolution) ? resolution : "Custom",
            options: ["Custom", ...presets],
            change: (value) => {
              const preset = SHEET_PRESETS.find(({ width, height }) => `${width} × ${height}` === value);
              if (preset) state.updatePage(id, { width: preset.width, height: preset.height });
            },
          },
          ...sizeFields(page, (size) => state.updatePage(id, size), SHEET_LIMITS.min, SHEET_LIMITS.min, false, SHEET_LIMITS.max),
          {
            kind: "select", label: "Rulers", value: page.unit, options: PAGE_UNITS,
            change: (value) => {
              const unit = PAGE_UNITS.find((option) => option === value);
              if (unit) state.updatePage(id, { unit });
            },
          },
          { kind: "toggle", label: "Dots", value: page.dots, change: (dots) => state.updatePage(id, { dots }) },
        ],
      };
    }
    case "connection": {
      const item = state.connections.find((connection) => connection.id === id);
      if (!item) return null;
      return {
        fields: [
          colorField(item.color ?? "#44403c", (color) => state.updateConnection(id, { color })),
          thicknessField(item.size ?? 2, 48, (size) => state.updateConnection(id, { size })),
          { kind: "text", label: "Label", value: item.label ?? "", change: (label) => state.updateConnection(id, { label }) },
          {
            kind: "select", label: "Route", value: item.route ?? "straight", options: CONNECTOR_ROUTES,
            change: (value) => {
              const route = CONNECTOR_ROUTES.find((option) => option === value);
              if (route) state.updateConnection(id, { route });
            },
          },
          {
            kind: "select", label: "Pattern", value: item.pattern ?? (item.dashed ? "dash" : "solid"), options: CONNECTOR_PATTERNS,
            change: (value) => {
              const pattern = CONNECTOR_PATTERNS.find((option) => option === value);
              if (pattern) state.updateConnection(id, { pattern });
            },
          },
          { kind: "toggle", label: "Arrow", value: item.arrow !== false, change: (arrow) => state.updateConnection(id, { arrow }) },
        ],
      };
    }
  }
}
