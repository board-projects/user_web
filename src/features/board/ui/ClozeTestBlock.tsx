"use client";

import { ClozeAnswerFields } from "./ClozeAnswerFields";
import { ClozeQuestionEditor } from "./ClozeQuestionEditor";
import { getTextStyles } from "../domain/textFormat";
import React from "react";
import { ClozeTest } from "../domain/types";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";
import { clozeConnectable } from "../domain/connectableItems";
import { ConnectionPorts } from "./ConnectionPorts";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";

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
        <Rnd
            data-interactive="true"
            data-board-selection-key={key}
            data-board-connectable-id={id}
            cancel="[data-connection-handle], [data-cloze-editor], input"
            scale={zoom}
            position={{ x, y }}
            size={{ width: item.width, height: item.height }}
            minWidth={140}
            minHeight={100}
            enableResizing={!isEditing}
            resizeHandleComponent={isSelected ? itemResizeHandles : undefined}
            onResizeStart={() => selectBoardItem({ type: "cloze", id })}
            onResize={connected ? resize : undefined}
            onResizeStop={resize}
            {...dragItem({ type: "cloze", id }, { x, y }, (position) => updateClozeTest(id, position), connected)}
            onPointerDown={(e: { stopPropagation: () => void; }) => {
                e.stopPropagation();
                if (!isEditing) selectBoardItem({ type: "cloze", id });
            }}
            disableDragging={isEditing}
            className="z-50"
        >
            <div data-board-scroll
                className="flex h-full w-full flex-col gap-2 touch-pan-y overflow-auto break-words rounded-lg border border-stone-200 bg-white p-4 shadow-lg"
                style={itemSelectionStyle(isSelected || inMarquee)}
                onDoubleClick={() => startEditing(id)}
            >
                <div className="flex justify-between items-center border-b border-gray-100 pb-1 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{title || "Cloze Test"}</span>
                    {isEditing && <span className="text-[10px] text-green-600 font-bold">Editing...</span>}
                </div>

                {isEditing ? (
                    <ClozeQuestionEditor content={content} textFormat={textFormat} done={stopEditing}
                        update={(content) => updateClozeTest(id, { content })} />
                ) : (
                    <div className="whitespace-pre-wrap leading-loose text-gray-800" style={getTextStyles(textFormat, "left")}>
                        <ClozeAnswerFields itemId={id} content={content} />
                    </div>
                )}

                {isSelected && !isEditing && (
                    <div className="mt-2 text-[9px] text-gray-400 italic">
                        Double-click to edit text & placeholders
                    </div>
                )}
            </div>
            <ConnectionPorts item={item} selected={isSelected} />
        </Rnd>
    );
};
