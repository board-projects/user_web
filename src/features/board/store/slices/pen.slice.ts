export type PenSlice = {
    penColor: string;
    penSize: number;
    setPenColor: (color: string) => void;
    setPenSize: (size: number) => void;
};

export const createPenSlice = (set: any): PenSlice => ({
    penColor: "#6DD9B5",
    penSize: 10,
    setPenColor: (penColor) => set({ penColor }),
    setPenSize: (penSize) => set({ penSize }),
});
