"use client";

import { useRef, type ComponentProps } from "react";
import type { Rnd } from "react-rnd";
import { snapToPageDots } from "../domain/pageSnap";
import { pageMovementScope } from "../store/pageMovement";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";
import { selectionKey, type MoveScope, type Selection } from "../store/slices/selection.slice";

type BoardItem = Exclude<Selection, null>;
type DragProps = Pick<ComponentProps<typeof Rnd>, "onDragStart" | "onDrag" | "onDragStop">;

export function selectBoardItem(item: BoardItem) {
  const state = useBoardStore.getState();
  if (!state.marqueeSelection?.items.has(selectionKey(item.type, item.id))) state.select(item);
}

export function useBoardItemDrag() {
  const excludedPages = useRef<ReadonlySet<string>>(new Set());
  const moved = useRef(false);
  const wasSnapped = useRef(false);
  const groupDrag = useRef<{ key: string; position: Point; scope: MoveScope } | null>(null);

  return (item: BoardItem, position: Point, moveItem: (position: Point) => void, live = false): DragProps => {
    const key = selectionKey(item.type, item.id);

    const moveGroup = (next: Point) => {
      const drag = groupDrag.current;
      if (drag?.key !== key) return false;

      useBoardStore.getState().moveMarquee({
        x: next.x - drag.position.x,
        y: next.y - drag.position.y,
      }, drag.scope);
      drag.position = next;
      return true;
    };

    const snap = (node: HTMLElement, x: number, y: number) =>
      snapToPageDots({ x, y }, { width: node.offsetWidth, height: node.offsetHeight },
        useBoardStore.getState().sheets, excludedPages.current);

    return {
      onDragStart: () => {
        const state = useBoardStore.getState();
        const group = state.marqueeSelection?.items.has(key) ? state.marqueeSelection : null;
        if (!group) state.select(item);
        moved.current = false;
        wasSnapped.current = false;
        const moving = group?.items ?? new Set([key]);
        excludedPages.current = new Set();

        if (group || item.type === "page") {
          const scope = pageMovementScope(state, {
            items: moving,
            lineIds: new Set(Array.from(group?.lines ?? [], (line) => line.id)),
          });
          excludedPages.current = new Set(state.sheets
            .filter((page) => scope.items.has(selectionKey("page", page.id)))
            .map((page) => page.id));
          groupDrag.current = { key, position, scope };
        } else {
          groupDrag.current = null;
        }
      },
      onDrag: (_, next) => {
        moved.current ||= next.deltaX !== 0 || next.deltaY !== 0;
        if (!moved.current) return;
        const snapped = snap(next.node, next.x, next.y);
        const offsetX = snapped.x - next.x;
        const offsetY = snapped.y - next.y;
        const isSnapped = offsetX !== 0 || offsetY !== 0;
        // Rnd owns its drag transform. Apply the snap offset without changing its pointer tracking.
        next.node.style.translate = isSnapped ? `${offsetX}px ${offsetY}px` : "";
        if (!moveGroup(snapped) && (live || isSnapped || wasSnapped.current)) moveItem(snapped);
        wasSnapped.current = isSnapped;
      },
      onDragStop: (_, next) => {
        if (moved.current) {
          const snapped = snap(next.node, next.x, next.y);
          next.node.style.translate = "";
          if (!moveGroup(snapped)) moveItem(snapped);
        }
        groupDrag.current = null;
      },
    };
  };
}
