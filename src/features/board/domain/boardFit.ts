import type { BoardContent } from "./boardSync";
import { getConnectableItems } from "./connectableItems";
import { getConnectorPoints } from "./connectorGeometry";
import { rotateVector } from "./shapeRotation";
import type { Point } from "./types";

export const INITIAL_VIEWPORT = { zoom: 1, panX: 0, panY: 0 };

export function fitBoardViewport(board: BoardContent, width: number, height: number) {
  if (width <= 0 || height <= 0) return INITIAL_VIEWPORT;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  const extend = ({ x, y }: Point, padding = 0) => {
    left = Math.min(left, x - padding);
    top = Math.min(top, y - padding);
    right = Math.max(right, x + padding);
    bottom = Math.max(bottom, y + padding);
  };

  const items = getConnectableItems(board);
  const itemById = new Map(items.map((item) => [item.id, item]));
  for (const item of items) {
    const halfWidth = item.width / 2;
    const halfHeight = item.height / 2;
    for (const x of [-halfWidth, halfWidth]) {
      for (const y of [-halfHeight, halfHeight]) {
        const corner = rotateVector({ x, y }, item.rotation);
        extend({ x: item.x + halfWidth + corner.x, y: item.y + halfHeight + corner.y });
      }
    }
  }

  for (const line of board.lines) {
    extend(line.from, line.size / 2);
    extend(line.to, line.size / 2);
  }

  for (const connection of board.connections) {
    const source = itemById.get(connection.sourceId);
    const target = itemById.get(connection.targetId);
    if (!source || !target) continue;
    for (const point of getConnectorPoints(connection, source, target)) extend(point, (connection.size ?? 2) / 2);
  }

  if (!Number.isFinite(left)) return INITIAL_VIEWPORT;

  const margin = Math.min(56, width / 4, height / 4);
  const zoom = Math.min(1,
    (width - margin * 2) / Math.max(1, right - left),
    (height - margin * 2) / Math.max(1, bottom - top),
  );
  return {
    zoom,
    panX: width / 2 - (left + right) / 2 * zoom,
    panY: height / 2 - (top + bottom) / 2 * zoom,
  };
}
