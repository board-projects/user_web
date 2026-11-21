"use client";

import React, { useState } from "react";
import { ClozeTest } from "../domain/types";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";

export const ClozeTestBlock = ({ id, content, x, y }: ClozeTest) => {

    const [isEditing, setIsEditing] = useState(false);
    const zoom = useBoardStore((s) => s.zoom);
    const selection = useBoardStore((s) => s.selection);
    const dragItem = useBoardItemDrag();
    const updateClozeTest = useBoardStore((s) => s.updateClozeTest);

    const key = selectionKey("cloze", id);
    const inMarquee = useBoardStore((s) => s.marqueeSelection?.items.has(key) ?? false);
    const isSelected = selection?.type === "cloze" && selection.id === id;

    const renderContent = () => {
        const parts = content.split(/(\[.*?\])/g);
        return parts.map((part, index) => {
            if (part.startsWith("[") && part.endsWith("]")) {
                const answer = part.slice(1, -1);
                return (
                    <input 
                        key={index}
                        type="text" 
                        placeholder="..."
                        style={{ width: `${answer.length + 2}ch` }} // تنظیم عرض بر اساس طول کلمه
                        className="mx-1 border-b-2 border-blue-500 bg-blue-50 text-center outline-none focus:border-blue-700"
                        data-interactive="true"
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <Rnd
            data-interactive="true"
            data-board-selection-key={key}
            scale={zoom}
            position={{ x, y }}
            enableResizing={false}
            {...dragItem({ type: "cloze", id }, { x, y }, (position) => updateClozeTest(id, position))}
            onPointerDown={(e: { stopPropagation: () => void; }) => {
                e.stopPropagation();
                selectBoardItem({ type: "cloze", id });
            }}
            disableDragging={isEditing}
            className={`rounded-lg border-2 bg-white p-4 shadow-lg z-[50] ${
                isSelected || inMarquee ? "border-blue-600 ring-2 ring-blue-300" : "border-gray-200"
            }`}
        >
            <div 
                className="flex flex-col gap-2 min-w-[200px]"
                onDoubleClick={() => setIsEditing(true)}
            >
                <div className="flex justify-between items-center border-b border-gray-100 pb-1 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Cloze Test</span>
                    {isEditing && <span className="text-[10px] text-green-600 font-bold">Editing...</span>}
                </div>

                {isEditing ? (
                    <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => updateClozeTest(id, { content: e.target.value })}
                        onBlur={() => setIsEditing(false)}
                        className="w-full text-gray-800 leading-loose outline-none bg-gray-50 p-2 rounded border border-dashed border-gray-300 resize-none overflow-hidden"
                        style={{ height: 'auto' }}
                        data-interactive="true"
                    />
                ) : (
                    <div className="leading-loose text-gray-800 cursor-text">
                        {renderContent()}
                    </div>
                )}

                {isSelected && !isEditing && (
                    <div className="mt-2 text-[9px] text-gray-400 italic">
                        Double-click to edit text & placeholders
                    </div>
                )}
            </div>
        </Rnd>
    );
};