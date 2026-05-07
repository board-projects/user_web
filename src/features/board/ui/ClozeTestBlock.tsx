"use client";

import React, { useState } from "react";
import { ClozeTest } from "../domain/types";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";

export const ClozeTestBlock = ({ id, content, x, y }: ClozeTest) => {
    const [text, setText] = useState(content);
    
    const zoom = useBoardStore((s) => s.zoom);
    
    const selection = useBoardStore((s) => s.selection);
    const select = useBoardStore((s) => s.select);
    const updateClozeTest = useBoardStore((s) => s.updateClozeTest);

    const isSelected = selection?.type === "cloze" && selection.id === id;

    const renderContent = () => {
        const parts = text.split(/(\[.*?\])/g);
        return parts.map((part, index) => {
            if (part.startsWith("[") && part.endsWith("]")) {
                return (
                    <input 
                        key={index}
                        type="text" 
                        placeholder='...'
                        className="mx-1 w-20 border-b-2 border-blue-500 bg-blue-50 px-1 text-center outline-none focus:border-blue-700 focus:bg-blue-100 transition-all"
                        data-interactive="true"
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    }

    return (
        <Rnd
            scale={zoom} 
            position={{ x: x, y: y }}
            enableResizing={false}
            
            onDragStop={(e, d) => {
                updateClozeTest(id, { x: d.x, y: d.y });
            }}
            
            onPointerDown={(e: { stopPropagation: () => void; }) => {
                e.stopPropagation();
                select({ type: "cloze", id });
            }}
            
            className={`rounded-lg border-2 bg-white p-4 shadow-lg z-[50] ${
                isSelected ? "border-blue-600 ring-2 ring-blue-300" : "border-gray-200"
            }`}
            data-interactive="true"
        >
            <div className="flex flex-col gap-2 select-none pointer-events-auto">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cloze Test</div>
                <div className="leading-loose text-gray-800">
                    {renderContent()}
                </div>
            </div>
        </Rnd>
    );
};