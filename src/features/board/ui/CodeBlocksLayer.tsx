"use client";

import React, { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { codeConnectable } from "../domain/connectableItems";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";
import { ConnectionPorts } from "./ConnectionPorts";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";
import { getTextStyles } from "../domain/textFormat";
import { EditorView } from "@codemirror/view";

const codeExtensions = [
  javascript(),
  EditorView.theme({
    "& .cm-content": {
      fontWeight: "var(--item-font-weight)",
      fontStyle: "var(--item-font-style)",
      textDecoration: "var(--item-text-decoration)",
      textAlign: "var(--item-text-align)",
      fontFamily: "var(--item-font-family, monospace)",
      fontSize: "var(--item-font-size, inherit)",
    },
  }),
];

export function CodeBlocksLayer() {
  const dragItem = useBoardItemDrag();
  const connections = useBoardStore((s) => s.connections);
  const codeBlocks = useBoardStore((s) => s.codeBlocks);
  const updateCodeBlock = useBoardStore((s) => s.updateCodeBlock);

  const zoom = useBoardStore((s) => s.zoom);

  const selection = useBoardStore((s) => s.selection);
  const marqueeItems = useBoardStore((s) => s.marqueeSelection?.items);
  const select = useBoardStore((s) => s.select);

  const editingCodeBlockId = useBoardStore((s) => s.editingCodeBlockId);
  const startEditingCodeBlock = useBoardStore((s) => s.startEditingCodeBlock);
  const stopEditingCodeBlock = useBoardStore((s) => s.stopEditingCodeBlock);

  // نگه داشتن ref به EditorView هر بلاک برای focus کردن
  const viewsRef = useRef<Record<string, EditorView | null>>({});

  useEffect(() => {
    if (editingCodeBlockId) viewsRef.current[editingCodeBlockId]?.focus();
  }, [editingCodeBlockId]);

  const blurActiveElement = () => {
    const el = document.activeElement as HTMLElement | null;
    el?.blur?.();
  };

  return (
    <div
      className="absolute inset-0 z-50 pointer-events-none"
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
        // ✅ فقط اگر روی فضای خالی کلیک شد (نه روی آیتم‌های تعاملی)، از ادیت خارج شو
        const t = e.target as HTMLElement | null;
        if (t?.closest('[data-interactive="true"]')) return;

        stopEditingCodeBlock();
      }}
    >
      {codeBlocks.map((block) => {
        const format = getTextStyles(block.textFormat, "left");
        const editorStyle = {
          "--item-font-weight": format.fontWeight,
          "--item-font-style": format.fontStyle,
          "--item-text-decoration": format.textDecoration,
          "--item-text-align": format.textAlign,
          "--item-text-color": format.color,
          "--item-font-family": format.fontFamily,
          "--item-font-size": format.fontSize ? `${format.fontSize}px` : undefined,
        } as React.CSSProperties;
        const selected = selection?.type === "codeblock" && selection.id === block.id;
        const key = selectionKey("codeblock", block.id);
        const inMarquee = marqueeItems?.has(key);
        const isEditing = editingCodeBlockId === block.id;
        const connected = connections.some(({ sourceId, targetId }) => sourceId === block.id || targetId === block.id);
        const resize: React.ComponentProps<typeof Rnd>["onResize"] = (_, __, ref, ___, position) =>
          updateCodeBlock(block.id, { ...position, width: ref.offsetWidth, height: ref.offsetHeight });

        return (
          <Rnd
            key={block.id}
            data-interactive="true"
            data-board-selection-key={key}
            data-board-connectable-id={block.id}
            cancel="[data-connection-handle]"
            scale={zoom}
            size={{ width: block.width, height: block.height }}
            position={{ x: block.x, y: block.y }}
            minWidth={200}
            minHeight={100}
            {...dragItem({ type: "codeblock", id: block.id }, block, (position) => updateCodeBlock(block.id, position), connected)}
            onResizeStart={() => {
              stopEditingCodeBlock();
              select({ type: "codeblock", id: block.id });
            }}
            onResize={connected ? resize : undefined}
            onResizeStop={resize}
            resizeHandleComponent={selected ? itemResizeHandles : undefined}
            className="pointer-events-auto"
            // ✅ اینجا دیگه stopEditingCodeBlock نزن! فقط select کن
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              if (!isEditing) {
                selectBoardItem({ type: "codeblock", id: block.id });
                blurActiveElement();
              } // وقتی ادیت نیستیم، فوکوس رو بگیر تا Delete کار کنه
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                ...itemSelectionStyle(selected || !!inMarquee),
                borderRadius: 8,
                overflow: "hidden",
              }}
              onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                e.stopPropagation();
                if (!isEditing) {
                  selectBoardItem({ type: "codeblock", id: block.id });
                  blurActiveElement();
                }
              }}
              onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                select({ type: "codeblock", id: block.id });
                startEditingCodeBlock(block.id);
              }}
            >

              {/* ✅ وقتی ادیت نیستیم، لایه‌ی شفاف می‌ذاریم تا کلیک/درگ راحت باشه و ادیتور فوکوس نگیره */}
              {!isEditing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 4,
                    cursor: "move",
                  }}
                  onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    selectBoardItem({ type: "codeblock", id: block.id });
                    blurActiveElement();
                  }}
                  onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    select({ type: "codeblock", id: block.id });
                    startEditingCodeBlock(block.id);
                  }}
                />
              )}

              <CodeMirror
                value={block.code}
                className={`w-full h-full ${format.color ? "[&_.cm-content]:!text-[var(--item-text-color)] [&_.cm-content_span]:!text-[var(--item-text-color)]" : ""}`}
                height="100%"
                width="100%"
                extensions={codeExtensions}
                style={editorStyle}
                onChange={(value) => updateCodeBlock(block.id, { code: value })}
                theme="dark"
                editable={isEditing}
                onCreateEditor={(view) => {
                  viewsRef.current[block.id] = view;
                }}
                onBlur={() => {
                  // ✅ اگر واقعاً فوکوس از ادیتور رفت بیرون، ادیت رو ببند
                  setTimeout(() => {
                    const active = document.activeElement as HTMLElement | null;
                    if (!active?.closest(".cm-editor")) {
                      if (editingCodeBlockId === block.id) stopEditingCodeBlock();
                    }
                  }, 0);
                }}
              />
            </div>
            <ConnectionPorts item={codeConnectable(block)} selected={selected} />
          </Rnd>
        );
      })}
    </div>
  );
}