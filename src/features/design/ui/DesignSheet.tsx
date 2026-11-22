import { TableGrid } from "@/features/board/ui/TableGrid";
import { getTextStyles } from "@/features/board/domain/textFormat";
import { TextLink } from "@/features/board/ui/TextLink";
import { DrawingText } from "@/features/board/ui/DrawingText";
import { ShapeText } from "@/features/board/ui/ItemText";
import { groupDrawingLines } from "@/features/board/domain/drawings";
import { useId } from "react";
import type { BoardContent } from "@/features/board/domain/boardSync";
import { getConnectableItems, clozeConnectable } from "@/features/board/domain/connectableItems";
import { connectorArrow, connectorDashArray, connectorMidpoint, connectorPath, getConnectorPoints } from "@/features/board/domain/connectorGeometry";
import { STAR_POINTS } from "@/features/board/domain/shapeGeometry";
import { SHEET_DOT_GRID, type SheetLayout } from "../domain/sheetLayout";

export function DesignSheet({ layout, board, title }: { layout: SheetLayout; board: BoardContent; title: string }) {
  const gridId = useId();
  const items = new Map(getConnectableItems(board).map((item) => [item.id, item]));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      className="block h-auto w-full overflow-hidden"
      role="img"
      aria-label={title}
    >
      <defs>
        <pattern id={gridId} width={SHEET_DOT_GRID.step} height={SHEET_DOT_GRID.step} patternUnits="userSpaceOnUse">
          <circle cx={SHEET_DOT_GRID.step / 2} cy={SHEET_DOT_GRID.step / 2} r={SHEET_DOT_GRID.radius} fill={SHEET_DOT_GRID.color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={layout.backgroundColor ?? "#ffffff"} />
      {layout.dots && <rect width="100%" height="100%" fill={`url(#${gridId})`} />}
      {board.lines.map((line) => (
        <line key={line.id} x1={line.from.x} y1={line.from.y} x2={line.to.x} y2={line.to.y}
          stroke={line.color} strokeWidth={line.size} strokeLinecap="round" />
      ))}
      {Array.from(groupDrawingLines(board.lines), ([id, lines]) => <DrawingText key={id} lines={lines} linksEnabled />)}
      {board.connections.map((connection) => {
        const source = items.get(connection.sourceId);
        const target = items.get(connection.targetId);
        if (!source || !target) return null;
        const points = getConnectorPoints(connection, source, target);
        const midpoint = connectorMidpoint(points);
        const color = connection.color ?? "#44403c";
        const width = connection.size ?? 2;
        const arrow = connection.arrow !== false ? connectorArrow(points, Math.max(12, width * 1.4)) : undefined;
        return (
          <g key={connection.id}>
            <path d={connectorPath(points)} fill="none" stroke={color} strokeWidth={width}
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray={connectorDashArray(connection)} />
            {arrow && <polygon points={arrow} fill={color} />}
            {connection.label && (
              <TextLink link={connection.textFormat?.link}>
                <text x={midpoint.x} y={midpoint.y}
                  textAnchor={connection.textFormat?.align === "left" ? "start" : connection.textFormat?.align === "right" ? "end" : "middle"}
                  dominantBaseline="central" fontSize={13} fill={getTextStyles(connection.textFormat).color} style={getTextStyles(connection.textFormat)}>{connection.label}</text>
              </TextLink>
            )}
          </g>
        );
      })}
      {board.shapes.map((shape) => {
        const { x, y, width, height, color } = shape;
        if (shape.type === "circle") return <ellipse key={shape.id} cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} fill={color} />;
        if (shape.type === "star") {
          const points = STAR_POINTS.map(([px, py]) => `${x + width * px / 100},${y + height * py / 100}`).join(" ");
          return <polygon key={shape.id} points={points} fill={color} />;
        }
        return <rect key={shape.id} x={x} y={y} width={width} height={height} fill={color} />;
      })}
      {board.shapes.map((shape) => shape.label && (
        <g key={shape.id} transform={`translate(${shape.x} ${shape.y})`}>
          <ShapeText shape={shape.type} width={shape.width} height={shape.height} text={shape.label} runs={shape.textRuns} format={shape.textFormat} background={shape.color} linksEnabled />
        </g>
      ))}
      {board.codeBlocks.map((block) => (
        <foreignObject key={block.id} x={block.x} y={block.y} width={block.width} height={block.height}>
          <pre className="m-0 h-full overflow-hidden whitespace-pre-wrap break-words rounded-lg bg-stone-900 p-3 font-mono text-sm text-white" style={getTextStyles(block.textFormat, "left")}><TextLink link={block.textFormat?.link}>{block.code}</TextLink></pre>
        </foreignObject>
      ))}
      {board.clozeTests.map((cloze) => {
        const { x, y, width, height } = clozeConnectable(cloze);
        return (
          <foreignObject key={cloze.id} x={x} y={y} width={width} height={height}>
            <div className="h-full overflow-hidden break-words rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-800">
              <strong className="mb-2 block">{cloze.title || "Cloze Test"}</strong>
              <div className="whitespace-pre-wrap" style={getTextStyles(cloze.textFormat, "left")}><TextLink link={cloze.textFormat?.link}>{cloze.content.replace(/\[[^\]]*\]|\{\{[^}]*\}\}/g, "______")}</TextLink></div>
            </div>
          </foreignObject>
        );
      })}
      {board.tables.map((table) => (
        <g key={table.id} transform={`translate(${table.x} ${table.y})`}>
          <TableGrid {...table} linksEnabled />
        </g>
      ))}
    </svg>
  );
}
