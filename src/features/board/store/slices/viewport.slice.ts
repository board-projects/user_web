import { INITIAL_VIEWPORT } from "../../domain/boardFit";

import { transformViewport } from "../../domain/viewportTransform";

export type BoardTool = "select" | "pen";

export type ViewportSlice = {
  zoom: number;
  tool: BoardTool;
  setTool: (tool: BoardTool) => void;
  panMode: boolean;
  togglePanMode: () => void;
  panX: number;
  panY: number;

  setPan: (x: number, y: number) => void;
  zoomAt: (nextZoom: number, screenX: number, screenY: number) => void;
};

export const createViewportSlice = (set: any, get: any): ViewportSlice => ({
  ...INITIAL_VIEWPORT,
  tool: "select",
  setTool: (tool) => set({ tool, panMode: false }),
  panMode: false,
  togglePanMode: () => set({ panMode: !get().panMode }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  zoomAt: (nextZoom, x, y) => set(transformViewport(get(), nextZoom, { x, y })),
});
