import { useBoardStore } from "../store/board.store";
import { ClozeTestBlock } from "./ClozeTestBlock";


export const ClozeTestLayer = () => {
    const clozeTests = useBoardStore((s) => s.clozeTests);

    return (
        <>
            {clozeTests.map((test) => (
                <ClozeTestBlock 
                    key={test.id}
                    id={test.id}
                    content={test.content}
                    x={test.x}
                    y={test.y}
                    type="cloze_test"
                    title="Cloze Test"
                />
            ))}
        </>
    );
};