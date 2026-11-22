"use client";

import React from "react";
import { useTextEditingStore } from "../store/textEditing.store";
import { InlineItemTextEditor } from "./InlineItemTextEditor";
import { ShapeRotationHandle } from "./ShapeRotationHandle";
import { roundedShapePath } from "../domain/shapeCorners";
import { normalizeRotation } from "../domain/shapeRotation";
import { ShapeText } from "./ItemText";
import { Rnd } from "react-rnd";
import { useBoardStore } from "../store/board.store";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { selectionKey } from "../store/slices/selection.slice";

import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";
import { ConnectionPorts } from "./ConnectionPorts";
import { polygonClip, shapeDefinitions } from "../domain/shapeDefinitions";
import { shapeTextArea } from "./shapeTextLayout";

export function ShapesLayer() {
  const editingId = useTextEditingStore((state) => state.shapeId);
  const canEdit = useBoardStore((state) => state.tool === "select" && !state.panMode);
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

        const roundedPath = roundedShapePath(shape.type, shape.cornerRounding);
        const clipPath = roundedPath ? undefined : polygonClip(shape.type);
        const area = shapeTextArea(shape.type);
        const rotation = normalizeRotation(shape.rotation);

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
            title={shape.itemLabel || undefined}
            scale={zoom}
            size={{ width: shape.width, height: shape.height }}
            position={{ x: shape.x, y: shape.y }}
            {...dragItem({ type: "shape", id: shape.id }, shape, (position) => updateShape(shape.id, position), connected)}
            onResizeStart={() => select({ type: "shape", id: shape.id })}
            onResize={connected ? updateSize : undefined}
            onResizeStop={updateSize}
            cancel="[data-connection-handle], [data-rotation-handle], [contenteditable], a"
            enableResizing
            resizeHandleComponent={selected ? itemResizeHandles : undefined}
            lockAspectRatio={shapeDefinitions[shape.type].lockedAspect}
            className="pointer-events-auto"
            onDoubleClick={() => { if (canEdit) useTextEditingStore.setState({ shapeId: shape.id }); }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              selectBoardItem({ type: "shape", id: shape.id });
            }}
          >
            <div
              data-board-rotated-frame
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: clipPath || roundedPath ? "transparent" : shape.color,
                borderRadius: shape.type === "circle" ? "50%" : "0%",
                ...itemSelectionStyle(selected || !!inMarquee),
                position: "relative",
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
              }}
            >
              {roundedPath && (
                <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d={roundedPath} fill={shape.color} />
                </svg>
              )}
              {clipPath && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ backgroundColor: shape.color, clipPath }}
                />
              )}
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                <ShapeText shape={shape.type} linksEnabled width={shape.width} height={shape.height} text={editingId === shape.id ? undefined : shape.label} format={shape.textFormat} background={shape.color} runs={shape.textRuns} />
              </svg>
              {editingId === shape.id && (
                <div className="absolute z-10" style={{
                  left: `${area.x * 100}%`, top: `${area.y * 100}%`,
                  width: `${area.width * 100}%`, height: `${area.height * 100}%`,
                }}>
                  <InlineItemTextEditor itemId={shape.id} shape={shape.type} label="Shape text" value={shape.label ?? ""} runs={shape.textRuns} format={shape.textFormat} background={shape.color}
                    commit={(label, textRuns) => updateShape(shape.id, { label, textRuns })} close={() => useTextEditingStore.setState({ shapeId: null })} />
                </div>
              )}
            </div>
            <ConnectionPorts item={shape} selected={selected} />
            {selected && canEdit && editingId !== shape.id && (
              <ShapeRotationHandle shape={shape} zoom={zoom} rotate={(rotation) => updateShape(shape.id, { rotation })} />
            )}
          </Rnd>
        );
      })}
    </div>
  );
}