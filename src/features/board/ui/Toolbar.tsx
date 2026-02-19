"use client";

import React from "react";
import { TbRectangle } from "react-icons/tb";
import { FaRegCircle } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";
import { useBoardStore } from "../store/board.store";

export function Toolbar(props: {
    onAddRect: () => void;
    onAddCircle: () => void;
    onAddCode: () => void;
}) {
    const penColor = useBoardStore((s) => s.penColor);
    const penSize = useBoardStore((s) => s.penSize);
    const setPenColor = useBoardStore((s) => s.setPenColor);
    const setPenSize = useBoardStore((s) => s.setPenSize);

    return (
        <div className="z-50 absolute bg-stone-200 grid grid-cols-2 m-1 p-2 gap-2 rounded">
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
            <input
                className="w-16"
                min={1}
                max={250}
                value={penSize}
                type="number"
                onChange={(e) => setPenSize(Number(e.target.value))}
            />

            <button onClick={props.onAddCode} className="p-2">
                <FaCode />
            </button>
            <button onClick={props.onAddRect} className="p-2">
                <TbRectangle />
            </button>
            <button onClick={props.onAddCircle} className="p-2">
                <FaRegCircle />
            </button>
        </div>
    );
}
