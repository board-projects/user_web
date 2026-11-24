import { useBoardStore } from "../store/board.store";
import { ClozeTestBlock } from "./ClozeTestBlock";

export const ClozeTestLayer = () => {
    const clozeTests = useBoardStore((s) => s.clozeTests);

    return (
        <>
            {clozeTests.map((test) => <ClozeTestBlock key={test.id} {...test} />)}
        </>
    );
};
