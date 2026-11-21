"use client";

import { ConnectionStroke } from "./ConnectionStroke";
import { useMemo } from "react";
import { getShapePortPoint } from "../domain/shapeGeometry";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";

export function ConnectionsLayer() {
  const zoom = useBoardStore((state) => state.zoom);
  const connections = useBoardStore((state) => state.connections);
  const shapes = useBoardStore((state) => state.shapes);
  const selection = useBoardStore((state) => state.selection);
  const marqueeItems = useBoardStore((s) => s.marqueeSelection?.items);
  const updateConnection = useBoardStore((state) => state.updateConnection);
  const select = useBoardStore((state) => state.select);
  const draft = useBoardStore((state) => state.connectionDraft);
  const connecting = draft !== null;
  const shapeById = useMemo(() => new Map(shapes.map((shape) => [shape.id, shape])), [shapes]);

  const draftSource = draft ? shapeById.get(draft.sourceId) : undefined;
  const previewStart = draft && draftSource ? getShapePortPoint(draftSource, draft.sourcePort) : null;
  const snapTarget = draft?.snapTarget;
  const snapShape = snapTarget ? shapeById.get(snapTarget.id) : undefined;
  const previewEnd = snapTarget && snapShape ? getShapePortPoint(snapShape, snapTarget.port) : draft?.pointer;

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible">
      {previewStart && previewEnd && (
        <line
          x1={previewStart.x}
          y1={previewStart.y}
          x2={previewEnd.x}
          y2={previewEnd.y}
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {connections.map((connection) => {
        const source = shapeById.get(connection.sourceId);
        const target = shapeById.get(connection.targetId);
        if (!source || !target) return null;

        const selected = (selection?.type === "connection" && selection.id === connection.id)
          || !!marqueeItems?.has(selectionKey("connection", connection.id));

        return (
          <ConnectionStroke
            key={connection.id}
            connection={connection}
            source={source}
            target={target}
            selected={selected}
            interactive={!connecting}
            zoom={zoom}
            onSelect={() => select({ type: "connection", id: connection.id })}
            onLabelChange={(label) => updateConnection(connection.id, { label })}
          />
        );
      })}
    </svg>
  );
}
