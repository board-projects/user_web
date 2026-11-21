import type { StateCreator } from "zustand";
import type { ShapeConnection } from "../../domain/types";
import type { BoardState } from "../board.store";

export type ConnectionsSlice = {
  connections: ShapeConnection[];
  connecting: boolean;
  connectionSourceId: string | null;
  startConnecting: () => void;
  cancelConnecting: () => void;
  pickConnectionShape: (id: string) => void;
  removeConnection: (id: string) => void;
};

const idle = { connecting: false, connectionSourceId: null };

export const createConnectionsSlice: StateCreator<BoardState, [], [], ConnectionsSlice> = (set) => ({
  connections: [],
  ...idle,

  startConnecting: () => set({ connecting: true, connectionSourceId: null, selection: null }),
  cancelConnecting: () => set(idle),

  pickConnectionShape: (id) => set((state) => {
    if (!state.connecting || !state.shapes.some((shape) => shape.id === id)) return state;

    const sourceId = state.connectionSourceId;
    if (sourceId === id) return { connectionSourceId: null };
    if (!sourceId) return { connectionSourceId: id };

    const existing = state.connections.find((connection) =>
      (connection.sourceId === sourceId && connection.targetId === id) ||
      (connection.sourceId === id && connection.targetId === sourceId),
    );
    const connection = existing ?? { id: crypto.randomUUID(), sourceId, targetId: id };

    return {
      ...idle,
      connections: existing ? state.connections : [...state.connections, connection],
      selection: { type: "connection", id: connection.id },
    };
  }),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter((connection) => connection.id !== id),
  })),
});
