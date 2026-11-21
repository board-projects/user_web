"use client";

import React, { useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";
import type { EditorView } from "@codemirror/view";

export function CodeBlocksLayer() {
  const dragItem = useBoardItemDrag();
  const codeBlocks = useBoardStore((s) => s.codeBlocks);
  const updateCodeBlock = useBoardStore((s) => s.updateCodeBlock);
  const removeCodeBlock = useBoardStore((s) => s.removeCodeBlock);

  const zoom = useBoardStore((s) => s.zoom);

  const selection = useBoardStore((s) => s.selection);
  const marqueeItems = useBoardStore((s) => s.marqueeSelection?.items);
  const select = useBoardStore((s) => s.select);
  const clearSelection = useBoardStore((s) => s.clearSelection);

  const editingCodeBlockId = useBoardStore((s) => s.editingCodeBlockId);
  const startEditingCodeBlock = useBoardStore((s) => s.startEditingCodeBlock);
  const stopEditingCodeBlock = useBoardStore((s) => s.stopEditingCodeBlock);

  const extensions = useMemo(() => [javascript()], []);

  // نگه داشتن ref به EditorView هر بلاک برای focus کردن
  const viewsRef = useRef<Record<string, EditorView | null>>({});

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
        // اگر خواستی کلیک روی فضای خالی selection رو هم پاک کنه:
        // clearSelection();
      }}
    >
      {codeBlocks.map((block) => {
        const selected = selection?.type === "codeblock" && selection.id === block.id;
        const key = selectionKey("codeblock", block.id);
        const inMarquee = marqueeItems?.has(key);
        const isEditing = editingCodeBlockId === block.id;

        return (
          <Rnd
            key={block.id}
            data-interactive="true"
            data-board-selection-key={key}
            scale={zoom}
            size={{ width: block.width, height: block.height }}
            position={{ x: block.x, y: block.y }}
            minWidth={200}
            minHeight={100}
            {...dragItem({ type: "codeblock", id: block.id }, block, (position) => updateCodeBlock(block.id, position))}
            onResizeStart={() => {
              stopEditingCodeBlock();
              select({ type: "codeblock", id: block.id });
            }}
            onResizeStop={(_, __, ref, ___, position) =>
              updateCodeBlock(block.id, {
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              })
            }
            className="pointer-events-auto"
            // ✅ اینجا دیگه stopEditingCodeBlock نزن! فقط select کن
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              selectBoardItem({ type: "codeblock", id: block.id });
              if (!isEditing) blurActiveElement(); // وقتی ادیت نیستیم، فوکوس رو بگیر تا Delete کار کنه
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                outline: inMarquee ? "2px solid #2563eb" : selected ? "2px solid rgba(0,0,0,0.6)" : "none",
                outlineOffset: 2,
                borderRadius: 8,
                overflow: "hidden",
              }}
              onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                e.stopPropagation();
                selectBoardItem({ type: "codeblock", id: block.id });
                if (!isEditing) blurActiveElement();
              }}
              onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                select({ type: "codeblock", id: block.id });
                startEditingCodeBlock(block.id);

                // ✅ بعد از فعال شدن edit، فوکوس بده به ادیتور
                requestAnimationFrame(() => {
                  viewsRef.current[block.id]?.focus();
                });
              }}
            >
              {selected && (
                <button
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    removeCodeBlock(block.id);
                    clearSelection();
                  }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 5,
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    cursor: "pointer",
                  }}
                  title="Delete"
                >
                  ×
                </button>
              )}

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
                    requestAnimationFrame(() => {
                      viewsRef.current[block.id]?.focus();
                    });
                  }}
                />
              )}

              <CodeMirror
                value={block.code}
                className="text-left w-full h-full"
                height="100%"
                width="100%"
                extensions={extensions}
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
          </Rnd>
        );
      })}
    </div>
  );
}