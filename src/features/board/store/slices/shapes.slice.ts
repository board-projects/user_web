import { Shape } from "../../domain/types";

export type ShapesSlice = {
  shapes: Shape[];
  addShape: (shape: Shape) => void;
  updateShape: (id: string, patch: Partial<Shape>) => void;
  removeShape: (id: string) => void;
};

export const createShapesSlice = (set: any): ShapesSlice => ({
  shapes: [],
  addShape: (shape) => set((s: any) => ({ shapes: [...s.shapes, shape] })),
  updateShape: (id, patch) =>
    set((s: any) => ({
      shapes: s.shapes.map((sh: Shape) =>
        sh.id === id ? { ...sh, ...patch } : sh,
      ),
    })),
  removeShape: (id) =>
    set((s: any) => ({ shapes: s.shapes.filter((sh: Shape) => sh.id !== id) })),
});
