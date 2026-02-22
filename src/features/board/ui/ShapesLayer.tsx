"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";

export function ShapesLayer() {
  const shapes = useBoardStore((s) => s.shapes);
  const updateShape = useBoardStore((s) => s.updateShape);
  const removeShape = useBoardStore((s) => s.removeShape);

  const zoom = useBoardStore((s) => s.zoom);

  const selection = useBoardStore((s) => s.selection);
  const select = useBoardStore((s) => s.select);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {shapes.map((shape) => {
        const selected = selection?.type === "shape" && selection.id === shape.id;

        return (
          <Rnd
            key={shape.id}
            data-interactive="true"
            scale={zoom}
            size={{ width: shape.width, height: shape.height }}
            position={{ x: shape.x, y: shape.y }}
            onDragStart={() => select({ type: "shape", id: shape.id })}
            onResizeStart={() => select({ type: "shape", id: shape.id })}
            onDragStop={(_, d) => updateShape(shape.id, { x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, position) =>
              updateShape(shape.id, {
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              })
            }
            enableResizing
            lockAspectRatio={shape.type === "circle"}
            className="pointer-events-auto"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              select({ type: "shape", id: shape.id });
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: shape.color,
                borderRadius: shape.type === "circle" ? "50%" : "0%",
                outline: selected ? "2px solid rgba(0,0,0,0.6)" : "none",
                outlineOffset: 2,
                position: "relative",
              }}
            >
              {selected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShape(shape.id);
                    // selection رو هم پاک می‌کنیم
                    useBoardStore.getState().clearSelection();
                  }}
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.2)",
                    background: "white",
                    cursor: "pointer",
                    lineHeight: "20px",
                  }}
                  title="Delete"
                >
                  ×
                </button>
              )}
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}