"use client";

import { ClozeQuestionView } from "./ClozeQuestionView";
import { ClozeQuestionEditor } from "./ClozeQuestionEditor";
import React from "react";
import { ClozeTest } from "../domain/types";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";
import { clozeConnectable } from "../domain/connectableItems";
import { ConnectionPorts } from "./ConnectionPorts";
import type { Rnd } from "react-rnd";
import { BoardResizable } from "./BoardResizable";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";

const clozeResizeCorners = { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true };

export const ClozeTestBlock = ({ id, content, title, x, y, width, height, textFormat }: ClozeTest) => {

    const isEditing = useBoardStore((s) => s.editingClozeTestId === id);
    const startEditing = useBoardStore((s) => s.startEditingClozeTest);
    const stopEditing = useBoardStore((s) => s.stopEditingClozeTest);
    const zoom = useBoardStore((s) => s.zoom);
    const selection = useBoardStore((s) => s.selection);
    const connected = useBoardStore((s) => s.connections.some(({ sourceId, targetId }) => sourceId === id || targetId === id));
    const dragItem = useBoardItemDrag();
    const updateClozeTest = useBoardStore((s) => s.updateClozeTest);

    const key = selectionKey("cloze", id);
    const inMarquee = useBoardStore((s) => s.marqueeSelection?.items.has(key) ?? false);
    const isSelected = selection?.type === "cloze" && selection.id === id;

    const item = clozeConnectable({ id, x, y, width, height });
    const resize: React.ComponentProps<typeof Rnd>["onResize"] = (_, __, ref, ___, position) =>
        updateClozeTest(id, { ...position, width: ref.offsetWidth, height: ref.offsetHeight });


    return (
        <BoardResizable
            data-interactive="true"
            data-board-selection-key={key}
            data-board-connectable-id={id}
            cancel="[data-connection-handle], [data-question-editor], input"
            scale={zoom}
            position={{ x, y }}
            size={{ width: item.width, height: item.height }}
            minWidth={140}
            minHeight={100}
            enableResizing={isSelected ? clozeResizeCorners : false}
            resizeHandleWrapperClass="touch-none"
            resizeHandleComponent={isSelected ? itemResizeHandles : undefined}
            onResizeStart={() => {
                if (!isEditing) selectBoardItem({ type: "cloze", id });
            }}
            onResize={connected ? resize : undefined}
            onResizeStop={resize}
            {...dragItem({ type: "cloze", id }, { x, y }, (position) => updateClozeTest(id, position), connected)}
            onPointerDown={(e: { stopPropagation: () => void; }) => {
                e.stopPropagation();
                if (!isEditing) selectBoardItem({ type: "cloze", id });
            }}
            disableDragging={isEditing}
            className={isEditing ? "z-[61]" : "z-50"}
        >
            <div className="h-full rounded-lg" style={itemSelectionStyle(isSelected || inMarquee)}
                onDoubleClick={() => startEditing(id)}>
                {isEditing ? (
                    <ClozeQuestionEditor content={content} textFormat={textFormat} done={stopEditing}
                        update={(content) => updateClozeTest(id, { content })} />
                ) : (
                    <ClozeQuestionView item={{ id, title, content, textFormat }} />
                )}
            </div>
            <ConnectionPorts item={item} selected={isSelected} />
        </BoardResizable>
    );
};
