import { create } from "zustand";

import { createPenSlice, PenSlice } from "./slices/pen.slice";
import { createViewportSlice, ViewportSlice } from "./slices/viewport.slice";
import { createShapesSlice, ShapesSlice } from "./slices/shapes.slice";
import { createBlocksSlice, BlocksSlice } from "./slices/blocks.slice";
import { createLinesSlice, LinesSlice } from "./slices/lines.slice";
import { createSelectionSlice, SelectionSlice } from '@/features/board/store/slices/selection.slice';

export type BoardState = PenSlice &
  ViewportSlice &
  ShapesSlice &
  BlocksSlice &
  LinesSlice &
  SelectionSlice;

export const useBoardStore = create<BoardState>((set, get, store) => ({
  ...createPenSlice(set),
  ...createViewportSlice(set, get),
  ...createShapesSlice(set),
  ...createBlocksSlice(set),
  ...createLinesSlice(set),
  ...createSelectionSlice(set, get, store),
}));
