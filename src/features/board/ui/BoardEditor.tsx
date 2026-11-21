"use client";

import React, { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { DEFAULT_SHEET } from "@/features/design/domain/sheetLayout";
import { PageBackgrounds } from "./PageBackgrounds";
import { PageItemsLayer } from "./PageItemsLayer";
import { ToastContainer, toast, Bounce } from "react-toastify";

import { useBoardStore } from "@/features/board/store/board.store";
import { useBoardSocket } from "@/features/board/hooks/useBoardSocket";
import { useMarqueeSelection } from "@/features/board/hooks/useMarqueeSelection";
import { DrawingLayer } from "@/features/board/ui/DrawingLayer";
import { MarqueeOverlay } from "@/features/board/ui/MarqueeOverlay";
import { useCanvasDraw } from "@/features/board/hooks/useCanvasDraw";
import { useWheelZoom } from "@/features/board/hooks/useWheelZoom";
import { useCanvasRedraw } from "@/features/board/hooks/useCanvasRedraw";
import { usePan } from "@/features/board/hooks/usePan";

import { BoardNavigation } from "@/features/board/ui/BoardNavigation";
import { ItemPropertiesToolbar } from "@/features/board/ui/properties/ItemPropertiesToolbar";
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

export function BoardEditor({ reference }: { reference: string }) {
  useLayoutEffect(() => {
    useBoardStore.setState(useBoardStore.getInitialState(), true);
  }, []);

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
  const addPage = useBoardStore((s) => s.addPage);
  const select = useBoardStore((s) => s.select);
  const addLine = useBoardStore((s) => s.addLine);

  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);
  const lines = useBoardStore((s) => s.lines);
  const selectedLines = useBoardStore((s) => s.marqueeSelection?.lines);

  const { status: syncStatus } = useBoardSocket(process.env.NEXT_PUBLIC_BASE_URL, reference);

  const draw = useCanvasDraw({
    canvasRef,
    boardAreaRef,
    penColor,
    penSize,
    onLine: addLine,
  });

  useCanvasRedraw({ canvasRef, lines, selectedLines, zoom, panX, panY });

  const inviteUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/board/${encodeURIComponent(reference)}`;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-white">
      <ToastContainer />
      <div data-ui="true" className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex max-w-[calc(100%-7rem)] flex-col items-start gap-1.5">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 shadow-sm hover:bg-cyan-50">
          Dashboard
        </Link>
        {syncStatus !== "connected" && (
          <div role="status" className="pointer-events-none rounded-md bg-stone-900 px-3 py-2 text-xs text-white">
            {syncStatus === "offline" ? "Board sync offline. Reconnecting…" : "Connecting to board…"}
          </div>
        )}
      </div>

      <Toolbar
        onAddRect={() => addShape(createRect())}
        onAddCircle={() => addShape(createCircle())}
        onAddStar={() => addShape(createStar())}
        onAddCode={() => addCodeBlock(createCodeBlock())}
        onAddClozeTest={() => addClozeTest(createClozeTest())}
        onAddPage={() => {
          const id = crypto.randomUUID();
          addPage({
            id, title: "Untitled page", unit: "px",
            x: (72 - panX) / zoom, y: (112 - panY) / zoom, ...DEFAULT_SHEET,
          });
          select({ type: "page", id });
        }}
      />

      <BoardNavigation viewport={boardAreaRef} />
      <ItemPropertiesToolbar viewport={boardAreaRef} />

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
        <PageBackgrounds />
        <MarqueeOverlay box={marquee.box} />
        <CanvasStage canvasRef={canvasRef} />

        <BoardViewport>
          <PageItemsLayer />
          <ConnectionsLayer />
          <ShapesLayer />
          <CodeBlocksLayer />
          <ClozeTestLayer />
          <DrawingLayer />
        </BoardViewport>
      </div>
    </div>
  );

}