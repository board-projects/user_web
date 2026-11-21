import type { DrawLine } from "../domain/types";

export function paintDrawingSegment(ctx: CanvasRenderingContext2D, line: DrawLine, selectionMargin = 0) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(line.from.x, line.from.y);
  ctx.lineTo(line.to.x, line.to.y);

  if (selectionMargin > 0) {
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = line.size + selectionMargin;
    ctx.stroke();
  }

  ctx.strokeStyle = line.color;
  ctx.lineWidth = line.size;
  ctx.stroke();
}
