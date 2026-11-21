import { BOARD_COLLECTIONS, type BoardChange, type BoardContent } from "./boardSync";

const identifier = /^[A-Za-z0-9_-]{1,128}$/;
const isId = (value: unknown): value is string => typeof value === "string" && identifier.test(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function serializeBoardArchive(title: string, state: BoardContent) {
  const content = Object.fromEntries(BOARD_COLLECTIONS.map((kind) => [kind, state[kind]]));
  return JSON.stringify({ version: 1, title, content }, null, 2);
}

export function prepareBoardImport(value: unknown, createId: () => string = () => crypto.randomUUID()): BoardChange[] {
  if (!isObject(value) || value.version !== 1 || !isObject(value.content)) {
    throw new Error("Choose a DeQuizMa board JSON file");
  }

  const seen = new Map<string, { id: string; kind: BoardChange["kind"] }>();
  const items: Array<{ kind: BoardChange["kind"]; item: Record<string, unknown> }> = [];
  for (const kind of BOARD_COLLECTIONS) {
    const collection = value.content[kind];
    if (kind === "tables" && collection === undefined) continue;
    if (!Array.isArray(collection)) throw new Error("The JSON file is missing a board collection");

    for (const item of collection) {
      if (!isObject(item) || !isId(item.id) || seen.has(item.id)) throw new Error("The JSON file contains invalid or duplicate item IDs");
      seen.set(item.id, { id: createId(), kind });
      items.push({ kind, item });
    }
  }

  const strokes = new Map<string, string>();
  const endpoint = (id: unknown) => {
    const match = isId(id) ? seen.get(id) : undefined;
    if (!match || match.kind === "connections" || match.kind === "lines") {
      throw new Error("A connector in this file points to a missing item");
    }
    return match.id;
  };

  // The server validates the remapped item shapes against the room protocol before import.
  return items.map(({ kind, item }) => {
    const id = seen.get(item.id as string)!.id;
    const copy = { ...item, id };
    if (kind === "connections") {
      Object.assign(copy, { sourceId: endpoint(item.sourceId), targetId: endpoint(item.targetId) });
    } else if (kind === "lines" && item.strokeId !== undefined) {
      if (!isId(item.strokeId)) throw new Error("The JSON file contains an invalid drawing ID");
      const group = strokes.get(item.strokeId) ?? createId();
      strokes.set(item.strokeId, group);
      Object.assign(copy, { strokeId: group });
    }
    return { kind, id, item: copy as BoardChange["item"] };
  });
}

