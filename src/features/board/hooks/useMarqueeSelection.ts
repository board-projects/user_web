"use client";

import { useRef, useState, type PointerEvent } from "react";
import { boxBetween, boxesIntersect, segmentIntersectsBox } from "../domain/marqueeGeometry";
import { connectorIntersectsBox, getConnectorPoints } from "../domain/connectorGeometry";
import { pageContainsPoint } from "../domain/pageGeometry";
import { drawingId } from "../domain/drawings";
import { getConnectableItems } from "../domain/connectableItems";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";
import { isBoardInteractiveTarget } from "./boardPointer";

type BoardPointerEvent = PointerEvent<HTMLDivElement>;
const DRAG_THRESHOLD = 4;

function boardPoint(area: HTMLDivElement, point: Point) {
  const { panX, panY, zoom } = useBoardStore.getState();
  const rect = area.getBoundingClientRect();
  return { x: (point.x - rect.left - panX) / zoom, y: (point.y - rect.top - panY) / zoom };
}

function selectPageAt(area: HTMLDivElement, point: Point) {
  const { sheets, select } = useBoardStore.getState();
  const position = boardPoint(area, point);
  for (let index = sheets.length - 1; index >= 0; index--) {
    const page = sheets[index];
    if (!pageContainsPoint(page, position)) continue;
    select({ type: "page", id: page.id });
    return;
  }
}

function selectInside(area: HTMLDivElement, start: Point, end: Point) {
  const state = useBoardStore.getState();
  const screenBox = boxBetween(start, end);
  const items = new Set<string>();

  for (const element of area.querySelectorAll("[data-board-selection-key]")) {
    if (!(element instanceof HTMLElement)) continue;
    const key = element.dataset.boardSelectionKey;
    const bounds = (element.querySelector("[data-board-rotated-frame]") ?? element).getBoundingClientRect();
    // Selecting content inside a page does not pull the containing page into the selection.
    const hits = element.hasAttribute("data-board-page-frame")
      ? screenBox.left <= bounds.left && screenBox.top <= bounds.top &&
        screenBox.right >= bounds.right && screenBox.bottom >= bounds.bottom
      : boxesIntersect(screenBox, bounds);
    if (key && hits) items.add(key);
  }

  const worldBox = boxBetween(boardPoint(area, start), boardPoint(area, end));
  const shapes = new Map(getConnectableItems(state).map((item) => [item.id, item]));
  for (const connection of state.connections) {
    const source = shapes.get(connection.sourceId);
    const target = shapes.get(connection.targetId);
    if (!source || !target) continue;
    if (connectorIntersectsBox(getConnectorPoints(connection, source, target), worldBox)) {
      items.add(selectionKey("connection", connection.id));
    }
  }

  const drawings = new Set(state.lines
    .filter((line) => segmentIntersectsBox(line.from, line.to, worldBox))
    .map(drawingId));
  const lines = new Set(state.lines.filter((line) => drawings.has(drawingId(line))));
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

  const cancelGesture = () => {
    gesture.current = null;
    setBox(null);
  };

  const cancel = (event: BoardPointerEvent) => {
    if (gesture.current?.id === event.pointerId) cancelGesture();
  };

  const onPointerUp = (event: BoardPointerEvent) => {
    const current = gesture.current;
    if (current?.id !== event.pointerId) return;
    cancel(event);

    const end = { x: event.clientX, y: event.clientY };
    const state = useBoardStore.getState();
    if (state.tool !== "select" || state.panMode) return;
    if (Math.hypot(end.x - current.start.x, end.y - current.start.y) >= DRAG_THRESHOLD) {
      selectInside(event.currentTarget, current.start, end);
    } else {
      selectPageAt(event.currentTarget, end);
    }
  };

  return { box, onPointerDown, onPointerMove, onPointerUp, cancel, cancelGesture };
}
