"use client";

import React, { useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import type { BoardSyncStatus } from "../services/boardSocket";
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

type Props = {
  reference: string;
  sheet?: { width: number; height: number; dots: boolean; scale: number };
  renderDesign?: (editor: ReactNode, sync: { status: BoardSyncStatus; waitForSync: () => Promise<void> }, toolbar: ReactNode) => ReactNode;
};

export function BoardEditor({ reference, sheet, renderDesign }: Props) {
  useLayoutEffect(() => {
    useBoardStore.setState(useBoardStore.getInitialState(), true);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const boardAreaRef = useRef<HTMLDivElement | null>(null);

  const disabledNavigation = useRef<HTMLDivElement | null>(null);
  const navigation = sheet ? disabledNavigation : boardAreaRef;
  useWheelZoom(navigation);
  usePan(navigation);

  const scale = sheet?.scale;
  const viewportWidth = sheet && sheet.width * sheet.scale;
  const viewportHeight = sheet && sheet.height * sheet.scale;
  useLayoutEffect(() => {
    if (scale !== undefined) useBoardStore.setState({ zoom: scale, panX: 0, panY: 0 });
  }, [scale]);

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

  const { status: syncStatus, waitForSync } = useBoardSocket(process.env.NEXT_PUBLIC_BASE_URL, reference);

  const draw = useCanvasDraw({
    canvasRef,
    boardAreaRef,
    penColor,
    penSize,
    onLine: addLine,
  });

  useCanvasRedraw({ canvasRef, lines, selectedLines, zoom, panX, panY, viewportWidth, viewportHeight });

  const inviteUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/board/${encodeURIComponent(reference)}`;

  const toolbar = (
      <Toolbar
        docked={!!sheet}
        onAddRect={() => addShape(createRect())}
        onAddCircle={() => addShape(createCircle())}
        onAddStar={() => addShape(createStar())}
        onAddCode={() => addCodeBlock(createCodeBlock())}
        onAddClozeTest={() => addClozeTest(createClozeTest())}
      />
  );

  const editor = (
    <div
      className={`relative overflow-hidden bg-white ${sheet ? "" : "h-dvh w-full"}`}
      style={sheet ? { width: viewportWidth, height: viewportHeight } : undefined}
    >
      <ToastContainer />
      {!sheet && <div data-ui="true" className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex max-w-[calc(100%-7rem)] flex-col items-start gap-1.5">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 shadow-sm hover:bg-cyan-50">
          Dashboard
        </Link>
        {(
          <Link href={`/board/${encodeURIComponent(reference)}/design`} className="inline-flex min-h-10 items-center rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 shadow-sm hover:bg-cyan-50">
            Test designer
          </Link>
        )}
        {syncStatus !== "connected" && (
          <div role="status" className="pointer-events-none rounded-md bg-stone-900 px-3 py-2 text-xs text-white">
            {syncStatus === "offline" ? "Board sync offline. Reconnecting…" : "Connecting to board…"}
          </div>
        )}
      </div>}

      {!sheet && toolbar}

      {!sheet && <BoardNavigation viewport={boardAreaRef} />}
      <ItemPropertiesToolbar viewport={boardAreaRef} />

      {!sheet && <InviteButton
        url={inviteUrl}
        onCopied={() =>
          toast.info("The link copied to clipboard", {
            position: "bottom-center",
            autoClose: 4000,
            theme: "colored",
            transition: Bounce,
          })
        }
      />}

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
        {!sheet && <GridCanvas />}
        {sheet?.dots && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 0.8px, transparent 1px)",
            backgroundSize: `${16 * sheet.scale}px ${16 * sheet.scale}px`,
          }} />
        )}
        <MarqueeOverlay box={marquee.box} />
        <CanvasStage canvasRef={canvasRef} viewportWidth={viewportWidth} viewportHeight={viewportHeight} />

        <BoardViewport>
          <ConnectionsLayer />
          <ShapesLayer />
          <CodeBlocksLayer />
          <ClozeTestLayer />
          <DrawingLayer />
        </BoardViewport>
      </div>
    </div>
  );

  return renderDesign ? renderDesign(editor, { status: syncStatus, waitForSync }, toolbar) : editor;
}