import { getDrawingFrame } from "../domain/drawings";
import type { DrawLine } from "../domain/types";
import { ItemText } from "./ItemText";

export function DrawingText({ lines, linksEnabled }: { lines: DrawLine[]; linksEnabled?: boolean }) {
  const labeledLine = lines.find((line) => line.label);
  const label = labeledLine?.label;
  const frame = label ? getDrawingFrame(lines) : null;
  if (!frame) return null;

  const width = Math.max(96, frame.width);
  const height = Math.max(32, frame.height);
  return <ItemText x={frame.x + (frame.width - width) / 2} y={frame.y + (frame.height - height) / 2}
    width={width} height={height} text={label} format={labeledLine?.textFormat ?? lines[0]?.textFormat} linksEnabled={linksEnabled} />;
}
