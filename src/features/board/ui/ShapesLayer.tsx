"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";

import { ConnectionPorts } from "./ConnectionPorts";
import { STAR_CLIP_PATH } from "../domain/shapeGeometry";

const resizeGrip = (
  <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-600 bg-white shadow-sm" />
);
const circleResizeHandles = {
  topLeft: resizeGrip, topRight: resizeGrip, bottomLeft: resizeGrip, bottomRight: resizeGrip,
};

export function ShapesLayer() {
  const connections = useBoardStore((s) => s.connections);
  const connectedIds = React.useMemo(
    () => new Set(connections.flatMap(({ sourceId, targetId }) => [sourceId, targetId])),
    [connections],
  );

  const shapes = useBoardStore((s) => s.shapes);
  const updateShape = useBoardStore((s) => s.updateShape);

  const zoom = useBoardStore((s) => s.zoom);

  const selection = useBoardStore((s) => s.selection);
  const marqueeItems = useBoardStore((s) => s.marqueeSelection?.items);
  const dragItem = useBoardItemDrag();
  const select = useBoardStore((s) => s.select);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {shapes.map((shape) => {
        const selected = selection?.type === "shape" && selection.id === shape.id;
        const key = selectionKey("shape", shape.id);
        const inMarquee = marqueeItems?.has(key);

        const isStar = shape.type === "star";

        const connected = connectedIds.has(shape.id);
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
            data-board-selection-key={key}
            data-board-connectable-id={shape.id}
            scale={zoom}
            size={{ width: shape.width, height: shape.height }}
            position={{ x: shape.x, y: shape.y }}
            {...dragItem({ type: "shape", id: shape.id }, shape, (position) => updateShape(shape.id, position), connected)}
            onResizeStart={() => select({ type: "shape", id: shape.id })}
            onResize={connected ? updateSize : undefined}
            onResizeStop={updateSize}
            cancel="[data-connection-handle]"
            enableResizing
            resizeHandleComponent={selected && shape.type === "circle" ? circleResizeHandles : undefined}
            lockAspectRatio={shape.type === "circle" || isStar}
            className="pointer-events-auto"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              selectBoardItem({ type: "shape", id: shape.id });
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: isStar ? "transparent" : shape.color,
                borderRadius: shape.type === "circle" ? "50%" : "0%",
                outline: inMarquee ? "2px solid #2563eb" : selected ? "2px solid rgba(0,0,0,0.6)" : "none",
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
              <ConnectionPorts item={shape} selected={selected} />
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}