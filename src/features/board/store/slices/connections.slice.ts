import type { StateCreator } from "zustand";
import type { Point, ShapeConnection } from "../../domain/types";
import type { BoardState } from "../board.store";

type ConnectionDraft = {
  sourceId: string;
  pointer: Point;
};

export type ConnectionsSlice = {
  connections: ShapeConnection[];
  connectionDraft: ConnectionDraft | null;
  startConnection: (sourceId: string, pointer: Point) => void;
  moveConnection: (pointer: Point) => void;
  finishConnection: (targetId: string | null) => void;
  cancelConnecting: () => void;
  removeConnection: (id: string) => void;
};

export const createConnectionsSlice: StateCreator<BoardState, [], [], ConnectionsSlice> = (set) => ({
  connections: [],
  connectionDraft: null,

  startConnection: (sourceId, pointer) => set((state) =>
    state.shapes.some((shape) => shape.id === sourceId)
      ? { connectionDraft: { sourceId, pointer } }
      : state,
  ),

  moveConnection: (pointer) => set((state) =>
    state.connectionDraft
      ? { connectionDraft: { ...state.connectionDraft, pointer } }
      : state,
  ),

  finishConnection: (targetId) => set((state) => {
    const draft = state.connectionDraft;
    if (!draft) return state;

    const { sourceId } = draft;
    if (!targetId || sourceId === targetId || !state.shapes.some((shape) => shape.id === targetId)) {
      return { connectionDraft: null };
    }

    const existing = state.connections.find((connection) =>
      (connection.sourceId === sourceId && connection.targetId === targetId) ||
      (connection.sourceId === targetId && connection.targetId === sourceId),
    );
    const connection = existing ?? { id: crypto.randomUUID(), sourceId, targetId };

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
