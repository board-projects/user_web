"use client";

import { useRef, type ComponentProps } from "react";
import type { Rnd } from "react-rnd";
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

    return {
      onDragStart: () => {
        const state = useBoardStore.getState();
        const group = state.marqueeSelection?.items.has(key) ? state.marqueeSelection : null;
        if (!group) state.select(item);

        if (group || item.type === "page") {
          const scope = pageMovementScope(state, {
            items: group?.items ?? new Set([key]),
            lineIds: new Set(Array.from(group?.lines ?? [], (line) => line.id)),
          });
          groupDrag.current = { key, position, scope };
        } else {
          groupDrag.current = null;
        }
      },
      onDrag: (_, next) => {
        if (!moveGroup(next) && live) moveItem({ x: next.x, y: next.y });
      },
      onDragStop: (_, next) => {
        if (!moveGroup(next)) moveItem({ x: next.x, y: next.y });
        groupDrag.current = null;
      },
    };
  };
}
