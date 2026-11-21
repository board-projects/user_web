"use client";

import { useMemo } from "react";
import { getConnectionEndpoints, getShapeBoundaryPoint } from "../domain/shapeGeometry";
import { useBoardStore } from "../store/board.store";

export function ConnectionsLayer() {
  const connections = useBoardStore((state) => state.connections);
  const shapes = useBoardStore((state) => state.shapes);
  const selection = useBoardStore((state) => state.selection);
  const select = useBoardStore((state) => state.select);
  const draft = useBoardStore((state) => state.connectionDraft);
  const connecting = draft !== null;
  const shapeById = useMemo(() => new Map(shapes.map((shape) => [shape.id, shape])), [shapes]);

  const draftSource = draft ? shapeById.get(draft.sourceId) : undefined;
  const previewStart = draft && draftSource ? getShapeBoundaryPoint(draftSource, draft.pointer) : null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible">
      {draft && previewStart && (
        <line
          x1={previewStart.x}
          y1={previewStart.y}
          x2={draft.pointer.x}
          y2={draft.pointer.y}
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

        const { from, to } = getConnectionEndpoints(source, target);
        const points = { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
        const selected = selection?.type === "connection" && selection.id === connection.id;
        const selectConnection = () => select({ type: "connection", id: connection.id });

        return (
          <g
            key={connection.id}
            data-interactive="true"
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
            <line
              {...points}
              stroke={selected ? "#2563eb" : "#44403c"}
              strokeWidth={selected ? 3 : 2}
              vectorEffect="non-scaling-stroke"
            />
            <line
              {...points}
              stroke="transparent"
              strokeWidth={16}
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: connecting ? "none" : "stroke", cursor: "pointer" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
