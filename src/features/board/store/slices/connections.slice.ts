import { getConnectableItems } from "../../domain/connectableItems";
import type { StateCreator } from "zustand";
import type { Point, ShapeConnection, ShapePort } from "../../domain/types";
import { findNearbyShapePort, type ShapePortTarget } from "../../domain/shapeGeometry";
import type { BoardState } from "../board.store";

const SNAP_RADIUS_PX = 24;

type ConnectionDraft = {
  sourceId: string;
  sourcePort: ShapePort;
  pointer: Point;
  snapTarget: ShapePortTarget | null;
};

export type ConnectionsSlice = {
  connections: ShapeConnection[];
  connectionDraft: ConnectionDraft | null;
  startConnection: (sourceId: string, sourcePort: ShapePort, pointer: Point) => void;
  moveConnection: (pointer: Point) => void;
  finishConnection: (pointer: Point | null, fallbackTarget: ShapePortTarget | null) => void;
  cancelConnecting: () => void;
  updateConnection: (id: string, style: Pick<ShapeConnection, "color" | "size" | "pattern" | "route" | "label" | "arrow">) => void;
  removeConnection: (id: string) => void;
};

function getSnapTarget(state: BoardState, sourceId: string, pointer: Point) {
  return findNearbyShapePort(getConnectableItems(state), sourceId, pointer, SNAP_RADIUS_PX / state.zoom);
}

export const createConnectionsSlice: StateCreator<BoardState, [], [], ConnectionsSlice> = (set) => ({
  connections: [],
  connectionDraft: null,

  startConnection: (sourceId, sourcePort, pointer) => set((state) =>
    getConnectableItems(state).some((shape) => shape.id === sourceId)
      ? { connectionDraft: { sourceId, sourcePort, pointer, snapTarget: null } }
      : state,
  ),

  moveConnection: (pointer) => set((state) =>
    state.connectionDraft
      ? {
          connectionDraft: {
            ...state.connectionDraft,
            pointer,
            snapTarget: getSnapTarget(state, state.connectionDraft.sourceId, pointer),
          },
        }
      : state,
  ),

  finishConnection: (pointer, fallbackTarget) => set((state) => {
    const draft = state.connectionDraft;
    if (!draft) return state;

    const { sourceId, sourcePort } = draft;
    const target = pointer ? getSnapTarget(state, sourceId, pointer) ?? fallbackTarget : null;
    if (!target || sourceId === target.id || !getConnectableItems(state).some((shape) => shape.id === target.id)) {
      return { connectionDraft: null };
    }

    const { id: targetId, port: targetPort } = target;
    const existing = state.connections.find((connection) =>
      (connection.sourceId === sourceId && connection.sourcePort === sourcePort &&
        connection.targetId === targetId && connection.targetPort === targetPort) ||
      (connection.sourceId === targetId && connection.sourcePort === targetPort &&
        connection.targetId === sourceId && connection.targetPort === sourcePort),
    );
    const connection = existing ?? { id: crypto.randomUUID(), sourceId, sourcePort, targetId, targetPort };

    return {
      connectionDraft: null,
      connections: existing ? state.connections : [...state.connections, connection],
      selection: { type: "connection", id: connection.id },
    };
  }),

  cancelConnecting: () => set((state) => state.connectionDraft ? { connectionDraft: null } : state),

  updateConnection: (id, style) => set((state) => ({
    connections: state.connections.map((connection) =>
      connection.id === id ? { ...connection, ...style } : connection,
    ),
  })),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter((connection) => connection.id !== id),
  })),
});
