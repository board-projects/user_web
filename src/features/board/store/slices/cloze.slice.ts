import { ClozeTest } from "../../domain/types";

export type ClozeTestSlice = {
    clozeTests: ClozeTest[];
    addClozeTest: (test: ClozeTest) => void;
    updateClozeTest: (id: string, patch: Partial<ClozeTest>) => void;
    removeClozeTest: (id: string) => void;
}

export const createClozeTestSlice = ( set: any ) => ({
    clozeTests: [],
    addClozeTest: (test: ClozeTest) => set(( s: any ) => ({ 
            clozeTests: [...s.clozeTests, test] 
        })),
    updateClozeTest: ( id: any, patch: any ) => set(( s: any ) => ({
        clozeTests: s.clozeTests.map((clozeTest: ClozeTest) => 
            clozeTest.id === id ? { ...clozeTest, ...patch } : clozeTest
        )
    })),
    removeClozeTest: ( id: any ) => set(( s: any ) => ({
        clozeTests: s.clozeTests.filter((clozeTest: ClozeTest) => clozeTest.id !== id)
    })),
});