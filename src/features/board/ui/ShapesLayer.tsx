"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";

export function ShapesLayer() {
  const shapes = useBoardStore((s) => s.shapes);
  const updateShape = useBoardStore((s) => s.updateShape);
  const zoom = useBoardStore((s) => s.zoom);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {shapes.map((shape) => (
        <Rnd
          key={shape.id}
          data-interactive="true"
          scale={zoom} // ✅ مهم‌ترین خط برای حل پرش
          size={{ width: shape.width, height: shape.height }}
          position={{ x: shape.x, y: shape.y }}
          onDragStop={(_, d) => updateShape(shape.id, { x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, position) =>
            updateShape(shape.id, {
              x: position.x,
              y: position.y,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            })
          }
          // ✅ bounds رو برداشتم تا تو viewport محدود نشه
          // bounds="parent"
          lockAspectRatio={shape.type === "circle"}
          enableResizing
          className="pointer-events-auto"
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: shape.color,
              borderRadius: shape.type === "circle" ? "50%" : "0%",
            }}
          />
        </Rnd>
      ))}
    </div>
  );
}