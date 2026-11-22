import { create } from "zustand";
import type { TextFormat } from "../domain/textFormat";

type ActiveEditor = {
  itemId: string;
  format: TextFormat;
  apply: (format: TextFormat) => void;
};

export const useTextEditingStore = create<{
  shapeId: string | null;
  editor: ActiveEditor | null;
}>(() => ({ shapeId: null, editor: null }));
