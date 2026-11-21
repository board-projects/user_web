import type { ClozeTest, CodeBlock, PageItem, Shape } from "./types";

export type ConnectableItem = Omit<Shape, "color">;

type BoardItems = {
  shapes: readonly Shape[];
  codeBlocks: readonly CodeBlock[];
  clozeTests: readonly ClozeTest[];
  sheets: readonly PageItem[];
};

// Older cloze blocks use the same default size on every client.
export const CLOZE_SIZE = { width: 260, height: 160 } as const;

export const codeConnectable = (block: CodeBlock): ConnectableItem => ({ ...block, type: "rect" });

export const clozeConnectable = (test: Pick<ClozeTest, "id" | "x" | "y" | "width" | "height">): ConnectableItem =>
  ({ ...test, width: test.width ?? CLOZE_SIZE.width, height: test.height ?? CLOZE_SIZE.height, type: "rect" });

export const pageConnectable = (page: PageItem): ConnectableItem => ({ ...page, type: "rect" });

export function getConnectableItems({ shapes, codeBlocks, clozeTests, sheets }: BoardItems): ConnectableItem[] {
  return [...shapes, ...codeBlocks.map(codeConnectable), ...clozeTests.map(clozeConnectable), ...sheets.map(pageConnectable)];
}
