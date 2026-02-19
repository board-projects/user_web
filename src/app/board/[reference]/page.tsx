"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast, Bounce } from "react-toastify";

import { useBoardStore } from "@/features/board/store/board.store";
import { useBoardSocket } from "@/features/board/hooks/useBoardSocket";
import { useCanvasDraw } from "@/features/board/hooks/useCanvasDraw";
import { useWheelZoom } from "@/features/board/hooks/useWheelZoom";

import { Toolbar } from "@/features/board/ui/Toolbar";
import { InviteButton } from "@/features/board/ui/InviteButton";
import { CanvasStage } from "@/features/board/ui/CanvasStage";
import { ShapesLayer } from "@/features/board/ui/ShapesLayer";
import { CodeBlocksLayer } from "@/features/board/ui/CodeBlocksLayer";
import { BoardViewport } from "@/features/board/ui/BoardViewport";

import { createCircle, createCodeBlock, createRect } from "@/features/board/domain/factories";

export default function BoardPageClient() {
    const params = useParams<{ reference: string }>();
    const reference = params.reference;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useWheelZoom(containerRef);

    const penColor = useBoardStore((s) => s.penColor);
    const penSize = useBoardStore((s) => s.penSize);

    const addShape = useBoardStore((s) => s.addShape);
    const addCodeBlock = useBoardStore((s) => s.addCodeBlock);
    const addLine = useBoardStore((s) => s.addLine);

    const { emitDrawLine } = useBoardSocket({
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
        onDrawLine: (line) => {
            draw.drawLine(line);
            addLine(line);
        },
    });

    const draw = useCanvasDraw({
        canvasRef,
        penColor,
        containerRef,
        penSize,
        onLine: (line) => {
            emitDrawLine(line);
            addLine(line);
        },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/board/${reference}`;

    return (
        <div ref={containerRef} className="relative h-screen w-screen overflow-hidden">

            <ToastContainer />

            {/* ❌ اینا نباید زوم شن */}
            <Toolbar
                onAddRect={() => addShape(createRect())}
                onAddCircle={() => addShape(createCircle())}
                onAddCode={() => addCodeBlock(createCodeBlock())}
            />

            <InviteButton
                url={inviteUrl}
                onCopied={() =>
                    toast.info("The link copied to clipboard", {
                        position: "bottom-center",
                        autoClose: 4000,
                        theme: "colored",
                        transition: Bounce,
                    })
                }
            />

            <BoardViewport>
                <CanvasStage
                    canvasRef={canvasRef}
                    onMouseDown={draw.onMouseDown}
                    onMouseMove={draw.onMouseMove}
                    onMouseUp={draw.onMouseUp}
                />
                <ShapesLayer />
                <CodeBlocksLayer />
            </BoardViewport>

        </div>
    );
}
