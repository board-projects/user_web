import type { ClozeTest, CodeBlock, Shape } from "./types";

export type ConnectableItem = Omit<Shape, "color">;

type BoardItems = {
  shapes: readonly Shape[];
  codeBlocks: readonly CodeBlock[];
  clozeTests: readonly ClozeTest[];
};

// A fixed cloze frame gives all connected clients the same attachment geometry.
export const CLOZE_SIZE = { width: 260, height: 160 } as const;

export const codeConnectable = (block: CodeBlock): ConnectableItem => ({ ...block, type: "rect" });

export const clozeConnectable = (test: Pick<ClozeTest, "id" | "x" | "y">): ConnectableItem =>
  ({ ...test, ...CLOZE_SIZE, type: "rect" });

export function getConnectableItems({ shapes, codeBlocks, clozeTests }: BoardItems): ConnectableItem[] {
  return [...shapes, ...codeBlocks.map(codeConnectable), ...clozeTests.map(clozeConnectable)];
}
