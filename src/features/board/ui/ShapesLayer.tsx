"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";

import { STAR_CLIP_PATH } from "../domain/shapeGeometry";

export function ShapesLayer() {
  const connecting = useBoardStore((s) => s.connecting);
  const connectionSourceId = useBoardStore((s) => s.connectionSourceId);
  const pickConnectionShape = useBoardStore((s) => s.pickConnectionShape);
  const connections = useBoardStore((s) => s.connections);
  const connectedIds = React.useMemo(
    () => new Set(connections.flatMap(({ sourceId, targetId }) => [sourceId, targetId])),
    [connections],
  );

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

        const isStar = shape.type === "star";

        const connected = connectedIds.has(shape.id);
        const updatePosition: React.ComponentProps<typeof Rnd>["onDrag"] =
          (_, position) => updateShape(shape.id, { x: position.x, y: position.y });
        const updateSize: React.ComponentProps<typeof Rnd>["onResize"] =
          (_, __, ref, ___, position) => updateShape(shape.id, {
            x: position.x,
            y: position.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });

        return (
          <Rnd
            key={shape.id}
            data-interactive="true"
            scale={zoom}
            size={{ width: shape.width, height: shape.height }}
            position={{ x: shape.x, y: shape.y }}
            onDragStart={() => select({ type: "shape", id: shape.id })}
            onResizeStart={() => select({ type: "shape", id: shape.id })}
            onDrag={connected ? updatePosition : undefined}
            onDragStop={updatePosition}
            onResize={connected ? updateSize : undefined}
            onResizeStop={updateSize}
            disableDragging={connecting}
            enableResizing={!connecting}
            lockAspectRatio={shape.type === "circle" || isStar}
            className="pointer-events-auto"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              if (connecting) pickConnectionShape(shape.id);
              else select({ type: "shape", id: shape.id });
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: isStar ? "transparent" : shape.color,
                borderRadius: shape.type === "circle" ? "50%" : "0%",
                outline: connectionSourceId === shape.id
                  ? "2px solid #2563eb"
                  : selected ? "2px solid rgba(0,0,0,0.6)" : "none",
                outlineOffset: 2,
                position: "relative",
              }}
            >
              {isStar && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ backgroundColor: shape.color, clipPath: STAR_CLIP_PATH }}
                />
              )}
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