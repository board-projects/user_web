import type { BoardState } from "../store/board.store";

const COLLECTIONS = ["shapes", "codeBlocks", "clozeTests", "connections", "lines"] as const;
type Collection = typeof COLLECTIONS[number];

export type BoardContent = Pick<BoardState, Collection>;
export type BoardChange = {
  kind: Collection;
  id: string;
  item: BoardContent[Collection][number] | null;
};
export type BoardUpdate = { revision: number; changes: BoardChange[] };

export const EMPTY_BOARD: BoardContent = {
  shapes: [], codeBlocks: [], clozeTests: [], connections: [], lines: [],
};

export const changeKey = ({ kind, id }: BoardChange) => `${kind}:${id}`;

export function diffBoardContent(previous: BoardContent, next: BoardContent): BoardChange[] {
  const changes: BoardChange[] = [];
  for (const kind of COLLECTIONS) {
    if (previous[kind] === next[kind]) continue;

    const before = previous[kind];
    const after = next[kind];
    const previousItems = new Map(before.map((item) => [item.id, item]));
    for (const item of after) {
      if (previousItems.get(item.id) !== item) changes.push({ kind, id: item.id, item });
      previousItems.delete(item.id);
    }
    for (const id of previousItems.keys()) changes.push({ kind, id, item: null });
  }
  return changes;
}

export function applyBoardChanges(board: BoardContent, changes: readonly BoardChange[]): BoardContent {
  if (!changes.length) return board;
  const next = { ...board };

  function applyCollection<K extends Collection>(kind: K) {
    const updates = changes.filter((change) => change.kind === kind);
    if (!updates.length) return;

    // Each wire change belongs to the collection named by its kind.
    const items = new Map<string, BoardContent[K][number]>(board[kind].map((item) => [item.id, item]));
    for (const { id, item } of updates) {
      if (item) items.set(id, item as BoardContent[K][number]);
      else items.delete(id);
    }
    next[kind] = Array.from(items.values()) as BoardContent[K];
  }

  COLLECTIONS.forEach(applyCollection);
  return next;
}

export function reconcileBoardContent(current: BoardContent, next: BoardContent): Partial<BoardContent> {
  const patch: Partial<BoardContent> = {};
  function reconcile<K extends Collection>(kind: K) {
    const before = current[kind];
    const after = next[kind];
    if (before !== after && (before.length !== after.length || after.some((item, i) => item !== before[i]))) {
      patch[kind] = after;
    }
  }
  COLLECTIONS.forEach(reconcile);
  return patch;
}
