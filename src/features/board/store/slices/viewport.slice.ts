import { INITIAL_VIEWPORT } from "../../domain/boardFit";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

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

  zoomAt: (nextZoomRaw, screenX, screenY) => {
    const { zoom, panX, panY } = get();
    const nextZoom = clamp(nextZoomRaw, Math.min(zoom, 0.2), 4);

    const worldX = (screenX - panX) / zoom;
    const worldY = (screenY - panY) / zoom;

    const nextPanX = screenX - worldX * nextZoom;
    const nextPanY = screenY - worldY * nextZoom;

    set({
      zoom: nextZoom,
      panX: nextPanX,
      panY: nextPanY,
    });
  },
});
