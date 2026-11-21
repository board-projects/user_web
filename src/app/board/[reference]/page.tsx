"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast, Bounce } from "react-toastify";

import { useBoardStore } from "@/features/board/store/board.store";
import { useBoardSocket } from "@/features/board/hooks/useBoardSocket";
import { useMarqueeSelection } from "@/features/board/hooks/useMarqueeSelection";
import { MarqueeOverlay } from "@/features/board/ui/MarqueeOverlay";
import { useCanvasDraw } from "@/features/board/hooks/useCanvasDraw";
import { useWheelZoom } from "@/features/board/hooks/useWheelZoom";
import { useCanvasRedraw } from "@/features/board/hooks/useCanvasRedraw";
import { usePan } from "@/features/board/hooks/usePan";

import { BoardNavigation } from "@/features/board/ui/BoardNavigation";
import { Toolbar } from "@/features/board/ui/Toolbar";
import { InviteButton } from "@/features/board/ui/InviteButton";
import { CanvasStage } from "@/features/board/ui/CanvasStage";
import { ConnectionsLayer } from "@/features/board/ui/ConnectionsLayer";
import { ShapesLayer } from "@/features/board/ui/ShapesLayer";
import { CodeBlocksLayer } from "@/features/board/ui/CodeBlocksLayer";
import { BoardViewport } from "@/features/board/ui/BoardViewport";

import {
  createCircle,
  createClozeTest,
  createCodeBlock,
  createRect,
  createStar,
} from "@/features/board/domain/factories";
import { GridCanvas } from '@/features/board/ui/GridCanvas';
import { useDeleteSelected } from '@/features/board/hooks/useDeleteSelected';
import { ClozeTestLayer } from "@/features/board/ui/ClozeTestLayer";

export default function BoardPageClient() {
  const params = useParams<{ reference: string }>();
  const reference = params.reference;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const boardAreaRef = useRef<HTMLDivElement | null>(null);

  useWheelZoom(boardAreaRef);
  usePan(boardAreaRef);

  const marquee = useMarqueeSelection();

  useDeleteSelected();

  const penColor = useBoardStore((s) => s.penColor);
  const penSize = useBoardStore((s) => s.penSize);

  const addShape = useBoardStore((s) => s.addShape);
  const addCodeBlock = useBoardStore((s) => s.addCodeBlock);
  const addClozeTest = useBoardStore((s) => s.addClozeTest);
  const addLine = useBoardStore((s) => s.addLine);

  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);
  const lines = useBoardStore((s) => s.lines);
  const selectedLines = useBoardStore((s) => s.marqueeSelection?.lines);

  const { emitDrawLine } = useBoardSocket({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
    onDrawLine: (line) => {
      addLine(line);
    },
  });

  const draw = useCanvasDraw({
    canvasRef,
    boardAreaRef,
    penColor,
    penSize,
    onLine: (line) => {
      emitDrawLine(line);
      addLine(line);
    },
  });

  useCanvasRedraw({ canvasRef, lines, selectedLines, zoom, panX, panY });

  const inviteUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/board/${reference}`;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <ToastContainer />

      <Toolbar
        onAddRect={() => addShape(createRect())}
        onAddCircle={() => addShape(createCircle())}
        onAddStar={() => addShape(createStar())}
        onAddCode={() => addCodeBlock(createCodeBlock())}
        onAddClozeTest={() => addClozeTest(createClozeTest())}
      />

      <BoardNavigation viewport={boardAreaRef} />

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

      <div
        ref={boardAreaRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onPointerDown={(event) => {
          marquee.onPointerDown(event);
          draw.onPointerDown(event);
        }}
        onPointerMove={(event) => {
          marquee.onPointerMove(event);
          draw.onPointerMove(event);
        }}
        onPointerUp={(event) => {
          marquee.onPointerUp(event);
          draw.onPointerUp(event);
        }}
        onPointerCancel={(event) => {
          marquee.cancel(event);
          draw.onPointerUp(event);
        }}
        onLostPointerCapture={(event) => {
          marquee.cancel(event);
          draw.onPointerUp(event);
        }}
      >
        <GridCanvas />
        <MarqueeOverlay box={marquee.box} />
        <CanvasStage canvasRef={canvasRef} />

        <BoardViewport>
          <ConnectionsLayer />
          <ShapesLayer />
          <CodeBlocksLayer />
          <ClozeTestLayer />
        </BoardViewport>
      </div>
    </div>
  );
}