import type { ConnectableItem } from "../domain/connectableItems";
import { SHAPE_PORTS } from "../domain/types";
import { useBoardStore } from "../store/board.store";
import { ShapeConnectionHandle } from "./ShapeConnectionHandle";

export function ConnectionPorts({ item, selected }: { item: ConnectableItem; selected: boolean }) {
  const connecting = useBoardStore((state) => state.connectionDraft !== null);
  if (!selected && !connecting) return null;

  return SHAPE_PORTS.map((port) => <ShapeConnectionHandle key={port} item={item} port={port} />);
}
