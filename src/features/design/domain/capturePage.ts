import type { BoardChange, BoardContent } from "@/features/board/domain/boardSync";
import { clozeConnectable } from "@/features/board/domain/connectableItems";
import { pageContainsItem, pageContainsPoint } from "@/features/board/domain/pageGeometry";
import type { PageItem, Point } from "@/features/board/domain/types";

export function capturePage(board: BoardContent, page: PageItem) {
  const { x, y, width, height } = page;
  const local = (point: Point) => ({ x: point.x - x, y: point.y - y });
  const changes: BoardChange[] = [];
  const included = new Set<string>();

  const add = (kind: "shapes" | "codeBlocks" | "clozeTests", item: BoardContent[typeof kind][number], size: { width: number; height: number }) => {
    if (!pageContainsItem(page, { ...item, ...size })) return;
    changes.push({ kind, id: item.id, item: { ...item, ...local(item) } });
    included.add(item.id);
  };
  for (const item of board.shapes) add("shapes", item, item);
  for (const item of board.codeBlocks) add("codeBlocks", item, item);
  for (const item of board.clozeTests) add("clozeTests", item, clozeConnectable(item));
  for (const line of board.lines) {
    if (pageContainsPoint(page, line.from) && pageContainsPoint(page, line.to)) {
      changes.push({ kind: "lines", id: line.id, item: { ...line, from: local(line.from), to: local(line.to) } });
    }
  }
  for (const connection of board.connections) {
    if (included.has(connection.sourceId) && included.has(connection.targetId)) {
      changes.push({ kind: "connections", id: connection.id, item: connection });
    }
  }

  return {
    page: { ...page, x: 0, y: 0 },
    title: page.title.trim() || "Untitled page",
    layout: { width, height, dots: page.dots, backgroundColor: page.backgroundColor },
    snapshot: { revision: 0, changes },
  };
}
