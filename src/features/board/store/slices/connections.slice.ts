import type { StateCreator } from "zustand";
import type { Point, ShapeConnection, ShapePort } from "../../domain/types";
import type { BoardState } from "../board.store";

type ConnectionDraft = {
  sourceId: string;
  sourcePort: ShapePort;
  pointer: Point;
};

export type ConnectionsSlice = {
  connections: ShapeConnection[];
  connectionDraft: ConnectionDraft | null;
  startConnection: (sourceId: string, sourcePort: ShapePort, pointer: Point) => void;
  moveConnection: (pointer: Point) => void;
  finishConnection: (target: { id: string; port: ShapePort } | null) => void;
  cancelConnecting: () => void;
  removeConnection: (id: string) => void;
};

export const createConnectionsSlice: StateCreator<BoardState, [], [], ConnectionsSlice> = (set) => ({
  connections: [],
  connectionDraft: null,

  startConnection: (sourceId, sourcePort, pointer) => set((state) =>
    state.shapes.some((shape) => shape.id === sourceId)
      ? { connectionDraft: { sourceId, sourcePort, pointer } }
      : state,
  ),

  moveConnection: (pointer) => set((state) =>
    state.connectionDraft
      ? { connectionDraft: { ...state.connectionDraft, pointer } }
      : state,
  ),

  finishConnection: (target) => set((state) => {
    const draft = state.connectionDraft;
    if (!draft) return state;

    const { sourceId, sourcePort } = draft;
    if (!target || sourceId === target.id || !state.shapes.some((shape) => shape.id === target.id)) {
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

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter((connection) => connection.id !== id),
  })),
});
