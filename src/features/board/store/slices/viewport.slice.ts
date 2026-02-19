const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

export type ViewportSlice = {
    zoom: number;
    panX: number;
    panY: number;

    setPan: (x: number, y: number) => void;
    zoomAt: (nextZoom: number, screenX: number, screenY: number) => void;
};

export const createViewportSlice = (set: any, get: any): ViewportSlice => ({
    zoom: 1,
    panX: 0,
    panY: 0,

    setPan: (x, y) => set({ panX: x, panY: y }),

    zoomAt: (nextZoomRaw, screenX, screenY) => {
        const { zoom, panX, panY } = get();
        const nextZoom = clamp(nextZoomRaw, 0.2, 4);

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
