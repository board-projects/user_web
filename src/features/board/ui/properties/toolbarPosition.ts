type Bounds = { left: number; top: number; right: number; bottom: number };
type ToolbarSize = { width: number; height: number };

export function getPropertiesToolbarPosition(board: Bounds, anchor: Bounds, toolbar: ToolbarSize, placement: "above" | "right" = "above") {
  const inset = 8;
  const gap = 10;
  const clamp = (value: number, max: number) => Math.max(inset, Math.min(value, max - inset));
  const maxLeft = board.right - board.left - toolbar.width;
  const maxTop = board.bottom - board.top - toolbar.height;

  if (placement === "right") {
    const right = anchor.right - board.left + gap;
    const left = anchor.left - board.left - toolbar.width - gap;
    // Keep the controls on screen when the page is close to the viewport edge.
    const preferred = right <= maxLeft - inset || left < inset ? right : left;
    return { left: clamp(preferred, maxLeft), top: clamp(anchor.top - board.top, maxTop) };
  }

  const centered = (anchor.left + anchor.right - toolbar.width) / 2 - board.left;
  const above = anchor.top - board.top - toolbar.height - gap;
  const below = anchor.bottom - board.top + gap;

  return {
    left: clamp(centered, maxLeft),
    top: clamp(above >= inset ? above : below, maxTop),
  };
}
