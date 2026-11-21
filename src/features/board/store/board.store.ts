import { create } from "zustand";

import { createPenSlice, PenSlice } from "./slices/pen.slice";
import { createViewportSlice, ViewportSlice } from "./slices/viewport.slice";
import { createShapesSlice, ShapesSlice } from "./slices/shapes.slice";
import { createBlocksSlice, BlocksSlice } from "./slices/blocks.slice";
import { createLinesSlice, LinesSlice } from "./slices/lines.slice";
import { createSelectionSlice, SelectionSlice } from '@/features/board/store/slices/selection.slice';
import { createClozeTestSlice, ClozeTestSlice } from '@/features/board/store/slices/cloze.slice';

import { createConnectionsSlice, ConnectionsSlice } from "./slices/connections.slice";

export type BoardState = PenSlice &
  ViewportSlice &
  ShapesSlice &
  BlocksSlice &
  LinesSlice &
  SelectionSlice &
  ClozeTestSlice &
  ConnectionsSlice;

export const useBoardStore = create<BoardState>((set, get, store) => ({
  ...createPenSlice(set),
  ...createViewportSlice(set, get),
  ...createShapesSlice(set, get, store),
  ...createBlocksSlice(set),
  ...createLinesSlice(set),
  ...createSelectionSlice(set, get, store),
  ...createClozeTestSlice(set),
  ...createConnectionsSlice(set, get, store),
}));
