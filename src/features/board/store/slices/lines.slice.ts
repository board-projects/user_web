import { DrawLine } from "../../domain/types";

export type LinesSlice = {
    lines: DrawLine[];
    addLine: (line: DrawLine) => void;
    clearLines: () => void;
};

export const createLinesSlice = (set: any): LinesSlice => ({
    lines: [],
    addLine: (line) => set((s: any) => ({ lines: [...s.lines, line] })),
    clearLines: () => set({ lines: [] }),
});
