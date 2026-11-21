"use client";

import { useRef, useState, type PointerEvent } from "react";
import { boxBetween, boxesIntersect, segmentIntersectsBox } from "../domain/marqueeGeometry";
import { connectorIntersectsBox, getConnectorPoints } from "../domain/connectorGeometry";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";
import { isBoardInteractiveTarget } from "./boardPointer";

type BoardPointerEvent = PointerEvent<HTMLDivElement>;
const DRAG_THRESHOLD = 4;

function selectInside(area: HTMLDivElement, start: Point, end: Point) {
  const state = useBoardStore.getState();
  const screenBox = boxBetween(start, end);
  const items = new Set<string>();

  for (const element of area.querySelectorAll("[data-board-selection-key]")) {
    if (!(element instanceof HTMLElement)) continue;
    const key = element.dataset.boardSelectionKey;
    if (key && boxesIntersect(screenBox, element.getBoundingClientRect())) items.add(key);
  }

  const rect = area.getBoundingClientRect();
  const toWorld = (point: Point): Point => ({
    x: (point.x - rect.left - state.panX) / state.zoom,
    y: (point.y - rect.top - state.panY) / state.zoom,
  });
  const worldBox = boxBetween(toWorld(start), toWorld(end));
  const shapes = new Map(state.shapes.map((shape) => [shape.id, shape]));
  for (const connection of state.connections) {
    const source = shapes.get(connection.sourceId);
    const target = shapes.get(connection.targetId);
    if (!source || !target) continue;
    if (connectorIntersectsBox(getConnectorPoints(connection, source, target), worldBox)) {
      items.add(selectionKey("connection", connection.id));
    }
  }

  const lines = new Set(state.lines.filter((line) => segmentIntersectsBox(line.from, line.to, worldBox)));
  state.selectMarquee({ items, lines, anchor: { x: worldBox.left, y: worldBox.top } });
}

export function useMarqueeSelection() {
  const gesture = useRef<{ id: number; start: Point } | null>(null);
  const [box, setBox] = useState<ReturnType<typeof boxBetween> | null>(null);

  const onPointerDown = (event: BoardPointerEvent) => {
    if (event.defaultPrevented || !event.isPrimary || event.button !== 0 || isBoardInteractiveTarget(event.target)) return;
    const state = useBoardStore.getState();
    if (state.panMode || state.connectionDraft) return;
    state.clearSelection();
    if (state.tool !== "select") return;

    const start = { x: event.clientX, y: event.clientY };
    gesture.current = { id: event.pointerId, start };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onPointerMove = (event: BoardPointerEvent) => {
    const current = gesture.current;
    if (current?.id !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setBox(boxBetween(
      { x: current.start.x - rect.left, y: current.start.y - rect.top },
      { x: event.clientX - rect.left, y: event.clientY - rect.top },
    ));
  };

  const cancel = (event: BoardPointerEvent) => {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    setBox(null);
  };

  const onPointerUp = (event: BoardPointerEvent) => {
    const current = gesture.current;
    if (current?.id !== event.pointerId) return;
    cancel(event);

    const end = { x: event.clientX, y: event.clientY };
    const state = useBoardStore.getState();
    if (state.tool === "select" && !state.panMode &&
      Math.hypot(end.x - current.start.x, end.y - current.start.y) >= DRAG_THRESHOLD) {
      selectInside(event.currentTarget, current.start, end);
    }
  };

  return { box, onPointerDown, onPointerMove, onPointerUp, cancel };
}
