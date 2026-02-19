// src/features/board/store/board.store.ts
import { create } from "zustand";

import { createPenSlice, PenSlice } from "./slices/pen.slice";
import { createViewportSlice, ViewportSlice } from "./slices/viewport.slice";
import { createShapesSlice, ShapesSlice } from "./slices/shapes.slice";
import { createBlocksSlice, BlocksSlice } from "./slices/blocks.slice";
import { createLinesSlice, LinesSlice } from "./slices/lines.slice";

export type BoardState =
    & PenSlice
    & ViewportSlice
    & ShapesSlice
    & BlocksSlice
    & LinesSlice;

export const useBoardStore = create<BoardState>((set, get) => ({
    ...createPenSlice(set),
    ...createViewportSlice(set, get),
    ...createShapesSlice(set),
    ...createBlocksSlice(set),
    ...createLinesSlice(set),
}));
