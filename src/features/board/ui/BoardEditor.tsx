"use client";

import React, { useLayoutEffect, useRef } from "react";
import { DEFAULT_SHEET } from "@/features/design/domain/sheetLayout";
import { PageBackgrounds } from "./PageBackgrounds";
import { createTable } from "../domain/tables";
import { TablesLayer } from "./TablesLayer";
import { PageItemsLayer } from "./PageItemsLayer";

import { useBoardStore } from "@/features/board/store/board.store";
import { useBoardSocket } from "@/features/board/hooks/useBoardSocket";
import { useMarqueeSelection } from "@/features/board/hooks/useMarqueeSelection";
import { DrawingLayer } from "@/features/board/ui/DrawingLayer";
import { MarqueeOverlay } from "@/features/board/ui/MarqueeOverlay";
import { useCanvasDraw } from "@/features/board/hooks/useCanvasDraw";
import { useWheelZoom } from "@/features/board/hooks/useWheelZoom";
import { useCanvasRedraw } from "@/features/board/hooks/useCanvasRedraw";
import { useBoardTouch } from "../hooks/useBoardTouch";
import { usePan } from "@/features/board/hooks/usePan";

import { BoardNavigation } from "@/features/board/ui/BoardNavigation";
import { ItemPropertiesToolbar } from "@/features/board/ui/properties/ItemPropertiesToolbar";
import { Toolbar } from "@/features/board/ui/Toolbar";
import { BoardMenu } from "./BoardMenu";
import { CanvasStage } from "@/features/board/ui/CanvasStage";
import { ConnectionsLayer } from "@/features/board/ui/ConnectionsLayer";
import { ShapesLayer } from "@/features/board/ui/ShapesLayer";
import { CodeBlocksLayer } from "@/features/board/ui/CodeBlocksLayer";
import { BoardViewport } from "@/features/board/ui/BoardViewport";

import {
  createClozeTest,
  createCodeBlock,
  createShape,
} from "@/features/board/domain/factories";
import { GridCanvas } from '@/features/board/ui/GridCanvas';
import { useDeleteSelected } from '@/features/board/hooks/useDeleteSelected';
import { QuestionItemsLayer } from "./QuestionItemsLayer";
import { createMultipleChoice, QUESTION_MIN_SIZE } from "../domain/multipleChoice";
import { ClozeTestLayer } from "@/features/board/ui/ClozeTestLayer";

export function BoardEditor({ reference }: { reference: string }) {
  useLayoutEffect(() => {
    useBoardStore.setState(useBoardStore.getInitialState(), true);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const boardAreaRef = useRef<HTMLDivElement | null>(null);

  useWheelZoom(boardAreaRef);

  const marquee = useMarqueeSelection();

  useDeleteSelected();

  const penColor = useBoardStore((s) => s.penColor);
  const penSize = useBoardStore((s) => s.penSize);

  const addShape = useBoardStore((s) => s.addShape);
  const addCodeBlock = useBoardStore((s) => s.addCodeBlock);
  const addQuestion = useBoardStore((s) => s.addQuestion);
  const startEditingQuestion = useBoardStore((s) => s.startEditingQuestion);
  const addClozeTest = useBoardStore((s) => s.addClozeTest);
  const addTable = useBoardStore((s) => s.addTable);
  const setTool = useBoardStore((s) => s.setTool);
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

  useBoardTouch(boardAreaRef, () => {
    marquee.cancelGesture();
    draw.cancelDrawing();
    useBoardStore.getState().cancelConnecting();
  });
  usePan(boardAreaRef);

  useCanvasRedraw({ canvasRef, lines, selectedLines, zoom, panX, panY });

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-white">
      <BoardMenu reference={reference} status={syncStatus} />

      <Toolbar
        onAddShape={(type) => addShape(createShape(type))}
        onAddCode={() => addCodeBlock(createCodeBlock())}
        onAddClozeTest={() => {
          const { selection, sheets } = useBoardStore.getState();
          const page = selection?.type === "page" ? sheets.find((item) => item.id === selection.id) : undefined;
          addClozeTest(createClozeTest(page));
        }}
        onAddTable={(rows, columns) => {
          const table = createTable({ x: (72 - panX) / zoom, y: (112 - panY) / zoom }, rows, columns);
          addTable(table);
          setTool("select");
          select({ type: "table", id: table.id });
        }}
        onAddMultipleChoice={() => {
          const viewportWidth = boardAreaRef.current?.clientWidth ?? 0;
          const inset = viewportWidth && viewportWidth < 640 ? 16 : 72;
          const item = createMultipleChoice({ x: (inset - panX) / zoom, y: (112 - panY) / zoom });
          if (viewportWidth && viewportWidth < 640) {
            item.width = Math.max(QUESTION_MIN_SIZE.width, Math.min(item.width, (viewportWidth - inset * 2 - 44) / zoom));
          }
          addQuestion(item);
          setTool("select");
          select({ type: "question", id: item.id });
          startEditingQuestion(item.id);
        }}
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
      <ItemPropertiesToolbar reference={reference} viewport={boardAreaRef} />

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
          <QuestionItemsLayer />
          <TablesLayer />
          <DrawingLayer />
        </BoardViewport>
      </div>
    </div>
  );

}