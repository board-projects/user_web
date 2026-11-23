import type { BoardContent } from "../domain/boardSync";
import { clozeConnectable } from "../domain/connectableItems";
import { groupDrawingLines } from "../domain/drawings";
import { pageContainsItem, pageContainsPoint } from "../domain/pageGeometry";
import { selectionKey, type MoveScope } from "./slices/selection.slice";

export function pageMovementScope(board: BoardContent, selected: MoveScope): MoveScope {
  const pages = board.sheets.filter((page) => selected.items.has(selectionKey("page", page.id)));
  if (!pages.length) return selected;

  const items = new Set(selected.items);
  const lineIds = new Set(selected.lineIds);
  for (const page of pages) {
    for (const shape of board.shapes) {
      if (pageContainsItem(page, shape)) items.add(selectionKey("shape", shape.id));
    }
    for (const block of board.codeBlocks) {
      if (pageContainsItem(page, block)) items.add(selectionKey("codeblock", block.id));
    }
    for (const cloze of board.clozeTests) {
      if (pageContainsItem(page, clozeConnectable(cloze))) items.add(selectionKey("cloze", cloze.id));
    }
    for (const table of board.tables) {
      if (pageContainsItem(page, table)) items.add(selectionKey("table", table.id));
    }
    for (const question of board.questions) {
      if (pageContainsItem(page, question)) items.add(selectionKey("question", question.id));
    }
    for (const nested of board.sheets) {
      const smaller = nested.width < page.width || nested.height < page.height;
      if (smaller && pageContainsItem(page, nested)) items.add(selectionKey("page", nested.id));
    }
  }

  for (const drawing of groupDrawingLines(board.lines).values()) {
    if (pages.some((page) => drawing.every((line) => pageContainsPoint(page, line.from) && pageContainsPoint(page, line.to)))) {
      for (const line of drawing) lineIds.add(line.id);
    }
  }

  return { items, lineIds };
}
