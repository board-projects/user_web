"use client";

import { useRef, type ComponentProps } from "react";
import type { Rnd } from "react-rnd";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";
import { selectionKey, type Selection } from "../store/slices/selection.slice";

type BoardItem = Exclude<Selection, null>;
type DragProps = Pick<ComponentProps<typeof Rnd>, "onDragStart" | "onDrag" | "onDragStop">;

export function selectBoardItem(item: BoardItem) {
  const state = useBoardStore.getState();
  if (!state.marqueeSelection?.items.has(selectionKey(item.type, item.id))) state.select(item);
}

export function useBoardItemDrag() {
  const groupDrag = useRef<{ key: string; position: Point } | null>(null);

  return (item: BoardItem, position: Point, moveItem: (position: Point) => void, live = false): DragProps => {
    const key = selectionKey(item.type, item.id);

    const moveGroup = (next: Point) => {
      const drag = groupDrag.current;
      if (drag?.key !== key) return false;

      useBoardStore.getState().moveMarquee({
        x: next.x - drag.position.x,
        y: next.y - drag.position.y,
      });
      drag.position = next;
      return true;
    };

    return {
      onDragStart: () => {
        const state = useBoardStore.getState();
        groupDrag.current = state.marqueeSelection?.items.has(key) ? { key, position } : null;
        if (!groupDrag.current) state.select(item);
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
