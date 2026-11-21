import type { StateCreator } from "zustand";
import type { BoardState } from "../board.store";
import { Shape } from "../../domain/types";

export type ShapesSlice = {
  shapes: Shape[];
  addShape: (shape: Shape) => void;
  updateShape: (id: string, patch: Partial<Shape>) => void;
  removeShape: (id: string) => void;
};

export const createShapesSlice: StateCreator<BoardState, [], [], ShapesSlice> = (set) => ({
  shapes: [],
  addShape: (shape) => set((s) => ({ shapes: [...s.shapes, shape] })),
  updateShape: (id, patch) =>
    set((s) => ({
      shapes: s.shapes.map((sh: Shape) =>
        sh.id === id ? { ...sh, ...patch } : sh,
      ),
    })),
  removeShape: (id) =>
    set((s) => ({
      shapes: s.shapes.filter((sh) => sh.id !== id),
      connections: s.connections.filter(({ sourceId, targetId }) => sourceId !== id && targetId !== id),
      connectionSourceId: s.connectionSourceId === id ? null : s.connectionSourceId,
    })),
});
