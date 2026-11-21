type Bounds = { left: number; top: number; right: number; bottom: number };
type ToolbarSize = { width: number; height: number };

export function getPropertiesToolbarPosition(board: Bounds, anchor: Bounds, toolbar: ToolbarSize) {
  const inset = 8;
  const gap = 10;
  const clamp = (value: number, max: number) => Math.max(inset, Math.min(value, max - inset));
  const centered = (anchor.left + anchor.right - toolbar.width) / 2 - board.left;
  const above = anchor.top - board.top - toolbar.height - gap;
  const below = anchor.bottom - board.top + gap;

  return {
    left: clamp(centered, board.right - board.left - toolbar.width),
    top: clamp(above >= inset ? above : below, board.bottom - board.top - toolbar.height),
  };
}
