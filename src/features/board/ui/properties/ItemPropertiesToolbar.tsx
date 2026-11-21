"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { FaTrash } from "react-icons/fa";
import { useBoardStore } from "../../store/board.store";
import { selectionKey } from "../../store/slices/selection.slice";
import { getItemProperties, getSelectedBoardItem } from "./itemProperties";
import { ItemPropertyControl, propertyButtonClass } from "./ItemPropertyControl";
import { getPropertiesToolbarPosition } from "./toolbarPosition";

export function ItemPropertiesToolbar({ viewport }: { viewport: RefObject<HTMLElement | null> }) {
  const selection = useBoardStore((state) => state.selection);
  const selectedItem = useBoardStore((state) => getSelectedBoardItem(state, state.selection));
  const marquee = useBoardStore((state) => state.marqueeSelection);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const properties = getItemProperties(useBoardStore.getState());

  const anchorSelector = selection && selectedItem
    ? `[data-board-selection-key="${CSS.escape(selectionKey(selection.type, selection.id))}"]`
    : marquee?.lines.size && !marquee.items.size ? "[data-board-drawing-selection]" : null;

  useLayoutEffect(() => {
    const board = viewport.current;
    const toolbar = toolbarRef.current;
    if (!board || !toolbar || !anchorSelector) return;

    const anchor = board.querySelector(anchorSelector);
    if (!anchor) return;

    let frame = 0;
    const position = () => {
      frame = 0;
      const bounds = board.getBoundingClientRect();
      const item = anchor.getBoundingClientRect();
      if (item.right < bounds.left || item.left > bounds.right ||
          item.bottom < bounds.top || item.top > bounds.bottom) {
        toolbar.style.visibility = "hidden";
        return;
      }

      const { left, top } = getPropertiesToolbarPosition(bounds, item, toolbar.getBoundingClientRect());
      toolbar.style.left = `${left}px`;
      toolbar.style.top = `${top}px`;
      toolbar.style.visibility = "visible";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(position);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(board);
    resize.observe(toolbar);
    resize.observe(anchor);
    const unsubscribe = useBoardStore.subscribe(schedule);
    position();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      unsubscribe();
    };
  }, [anchorSelector, viewport]);

  if (!properties || !anchorSelector) return null;

  return (
    <div
      key={anchorSelector}
      ref={toolbarRef}
      role="group"
      aria-label="Selected item properties"
      data-ui="true"
      className="absolute z-[70] flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg"
      style={{ maxWidth: "calc(100% - 1rem)", visibility: "hidden" }}
    >
      {properties.fields.map((field) => <ItemPropertyControl key={field.label} field={field} />)}
      <button
        type="button"
        title="Delete selected item"
        aria-label="Delete selected item"
        className={`${propertyButtonClass} text-red-700`}
        onClick={() => {
          properties.remove();
          useBoardStore.getState().clearSelection();
        }}
      >
        <FaTrash aria-hidden="true" />
      </button>
    </div>
  );
}
