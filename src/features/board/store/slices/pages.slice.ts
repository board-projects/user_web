import type { StateCreator } from "zustand";
import type { PageItem } from "../../domain/types";
import type { BoardState } from "../board.store";

export type PagesSlice = {
  sheets: PageItem[];
  addPage: (page: PageItem) => void;
  updatePage: (id: string, patch: Partial<Omit<PageItem, "id">>) => void;
};

export const createPagesSlice: StateCreator<BoardState, [], [], PagesSlice> = (set) => ({
  sheets: [],
  addPage: (page) => set((state) => ({ sheets: [...state.sheets, page] })),
  updatePage: (id, patch) => set((state) => ({
    sheets: state.sheets.map((page) => page.id === id ? { ...page, ...patch } : page),
  })),
});
