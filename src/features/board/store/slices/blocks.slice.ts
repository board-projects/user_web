import { CodeBlock } from "../../domain/types";

export type BlocksSlice = {
    codeBlocks: CodeBlock[];
    addCodeBlock: (block: CodeBlock) => void;
    updateCodeBlock: (id: string, patch: Partial<CodeBlock>) => void;
    removeCodeBlock: (id: string) => void;
};

export const createBlocksSlice = (set: any): BlocksSlice => ({
    codeBlocks: [],
    addCodeBlock: (block) => set((s: any) => ({ codeBlocks: [...s.codeBlocks, block] })),
    updateCodeBlock: (id, patch) =>
        set((s: any) => ({
            codeBlocks: s.codeBlocks.map((b: CodeBlock) => (b.id === id ? { ...b, ...patch } : b)),
        })),
    removeCodeBlock: (id) =>
        set((s: any) => ({ codeBlocks: s.codeBlocks.filter((b: CodeBlock) => b.id !== id) })),
});
