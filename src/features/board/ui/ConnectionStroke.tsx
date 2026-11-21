import { useState } from "react";
import { ConnectionLabel } from "./ConnectionLabel";
import {
  connectorArrow,
  connectorDashArray,
  connectorMidpoint,
  connectorPath,
  getConnectorPoints,
} from "../domain/connectorGeometry";
import type { ConnectableItem } from "../domain/connectableItems";
import type { ShapeConnection } from "../domain/types";
import { selectionKey } from "../store/slices/selection.slice";

type Props = {
  connection: ShapeConnection;
  source: ConnectableItem;
  target: ConnectableItem;
  selected: boolean;
  interactive: boolean;
  zoom: number;
  onSelect: () => void;
  onLabelChange: (label: string) => void;
};

export function ConnectionStroke({ connection, source, target, selected, interactive, zoom, onSelect, onLabelChange }: Props) {
  const [editingLabel, setEditingLabel] = useState(false);
  const points = getConnectorPoints(connection, source, target);
  const path = connectorPath(points);
  const midpoint = connectorMidpoint(points);
  const color = connection.color ?? "#44403c";
  const width = connection.size ?? 2;
  const dash = connectorDashArray(connection);
  const arrow = connection.arrow !== false ? connectorArrow(points, Math.max(12, width * 1.4) / zoom) : undefined;

  return (
    <g
      data-interactive="true"
      role="button"
      aria-label={connection.label ? `Select connector: ${connection.label}` : "Select shape connector"}
      aria-pressed={selected}
      aria-disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      className="group/connector outline-none"
      onClick={interactive ? onSelect : undefined}
      onDoubleClick={interactive ? () => {
        onSelect();
        setEditingLabel(true);
      } : undefined}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="#93c5fd"
        strokeWidth={width + 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={selected ? undefined : "opacity-0 group-focus-visible/connector:opacity-100"}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {arrow && <polygon points={arrow} fill={color} />}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(16, width)}
        vectorEffect="non-scaling-stroke"
        style={{ pointerEvents: interactive ? "stroke" : "none", cursor: "pointer" }}
      />
      <circle
        data-board-selection-key={selectionKey("connection", connection.id)}
        cx={midpoint.x}
        cy={midpoint.y}
        r={1}
        fill="none"
      />
      <ConnectionLabel
        point={midpoint}
        zoom={zoom}
        label={connection.label ?? ""}
        editing={selected && editingLabel}
        interactive={interactive}
        onCancel={() => setEditingLabel(false)}
        onSave={(label) => {
          onLabelChange(label);
          setEditingLabel(false);
        }}
      />
    </g>
  );
}
