import type { BoardState } from "../../store/board.store";
import type { Selection } from "../../store/slices/selection.slice";

export type ItemProperty =
  | { kind: "number"; label: string; value: number; min: number; max: number; change: (value: number) => void }
  | { kind: "color" | "text"; label: string; value: string; change: (value: string) => void }
  | { kind: "toggle"; label: string; value: boolean; change: (value: boolean) => void }
  | { kind: "action"; label: string; run: () => void };

type ItemProperties = {
  fields: ItemProperty[];
  remove: () => void;
};

export function getSelectedBoardItem(state: BoardState, selection: Selection) {
  switch (selection?.type) {
    case "shape": return state.shapes.find((item) => item.id === selection.id);
    case "codeblock": return state.codeBlocks.find((item) => item.id === selection.id);
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
): ItemProperty[] {
  const widthField: ItemProperty = {
    kind: "number", label: square ? "Size" : "Width", value: width, min: minWidth, max: 4000,
    change: (value) => resize(square ? { width: value, height: value } : { width: value }),
  };
  if (square) return [widthField];

  return [widthField, {
    kind: "number", label: "Height", value: height, min: minHeight, max: 4000,
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
      remove: state.removeSelectedLines,
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
        remove: () => state.removeShape(id),
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
        remove: () => state.removeCodeBlock(id),
      };
    }
    case "cloze": {
      const item = state.clozeTests.find((block) => block.id === id);
      if (!item) return null;
      return {
        fields: [
          { kind: "text", label: "Title", value: item.title, change: (title) => state.updateClozeTest(id, { title }) },
          { kind: "action", label: "Edit content", run: () => state.startEditingClozeTest(id) },
        ],
        remove: () => state.removeClozeTest(id),
      };
    }
    case "connection": {
      const item = state.connections.find((connection) => connection.id === id);
      if (!item) return null;
      return {
        fields: [
          colorField(item.color ?? "#44403c", (color) => state.updateConnection(id, { color })),
          thicknessField(item.size ?? 2, 48, (size) => state.updateConnection(id, { size })),
          { kind: "toggle", label: "Dashed", value: item.dashed ?? false, change: (dashed) => state.updateConnection(id, { dashed }) },
        ],
        remove: () => state.removeConnection(id),
      };
    }
  }
}
