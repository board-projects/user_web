"use client";

import { useMemo } from "react";
import { getShapePortPoint } from "../domain/shapeGeometry";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";

export function ConnectionsLayer() {
  const connections = useBoardStore((state) => state.connections);
  const shapes = useBoardStore((state) => state.shapes);
  const selection = useBoardStore((state) => state.selection);
  const marqueeItems = useBoardStore((s) => s.marqueeSelection?.items);
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

        const from = getShapePortPoint(source, connection.sourcePort);
        const to = getShapePortPoint(target, connection.targetPort);
        const points = { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
        const selected = (selection?.type === "connection" && selection.id === connection.id)
          || marqueeItems?.has(selectionKey("connection", connection.id));
        const width = connection.size ?? 2;
        const selectConnection = () => select({ type: "connection", id: connection.id });

        return (
          <g
            key={connection.id}
            data-interactive="true"
            data-board-selection-key={selectionKey("connection", connection.id)}
            role="button"
            aria-label="Select shape connector"
            aria-pressed={selected}
            aria-disabled={connecting}
            tabIndex={connecting ? -1 : 0}
            onClick={connecting ? undefined : selectConnection}
            onKeyDown={(event) => {
              if (!connecting && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                selectConnection();
              }
            }}
          >
            {selected && (
              <line
                {...points}
                stroke="#93c5fd"
                strokeWidth={width + 4}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <line
              {...points}
              stroke={connection.color ?? "#44403c"}
              strokeWidth={width}
              strokeDasharray={connection.dashed ? "6 4" : undefined}
              vectorEffect="non-scaling-stroke"
            />
            <line
              {...points}
              stroke="transparent"
              strokeWidth={Math.max(16, width)}
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: connecting ? "none" : "stroke", cursor: "pointer" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
