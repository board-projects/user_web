"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { PageItemActions } from "@/features/design/ui/PageItemActions";
import { FaTrash } from "react-icons/fa";
import { useBoardStore } from "../../store/board.store";
import { selectionKey } from "../../store/slices/selection.slice";
import { useTextEditingStore } from "../../store/textEditing.store";
import { formatFields, getItemProperties, getSelectedBoardItem } from "./itemProperties";
import { ItemPropertyControl, propertyButtonClass } from "./ItemPropertyControl";
import { getPropertiesToolbarPosition } from "./toolbarPosition";

export function ItemPropertiesToolbar({ viewport }: {
  viewport: RefObject<HTMLElement | null>;
}) {
  const selection = useBoardStore((state) => state.selection);
  const selectedItem = useBoardStore((state) => getSelectedBoardItem(state, state.selection));
  const marquee = useBoardStore((state) => state.marqueeSelection);
  const editor = useTextEditingStore((state) => state.editor);
  const isPage = selection?.type === "page";
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

      const { left, top } = getPropertiesToolbarPosition(
        bounds, item, toolbar.getBoundingClientRect(), isPage ? "right" : "above",
      );
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

    // Draggable items can move via a CSS transform before their store position is saved.
    const movement = new MutationObserver(schedule);
    movement.observe(anchor, { attributes: true, attributeFilter: ["style"] });

    const unsubscribe = useBoardStore.subscribe(schedule);
    position();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      movement.disconnect();
      unsubscribe();
    };
  }, [anchorSelector, isPage, viewport]);

  if (!properties || !anchorSelector) return null;

  const deleteButton = (
    <button
      type="button"
      title="Delete selected item"
      aria-label="Delete selected item"
      className={`${propertyButtonClass} text-red-700`}
      onClick={() => useBoardStore.getState().deleteSelected()}
    >
      <FaTrash aria-hidden="true" />
    </button>
  );

  return (
    <div
      key={anchorSelector}
      ref={toolbarRef}
      role="group"
      aria-label="Selected item properties"
      data-ui="true"
      className={`absolute z-[70] flex gap-2 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg ${
        isPage
          ? "max-h-[calc(100%-1rem)] w-max flex-col items-stretch overflow-y-auto [overflow-wrap:anywhere] [&>label]:justify-between"
          : "items-center overflow-x-auto whitespace-nowrap"
      }`}
      style={{ maxWidth: isPage ? "min(14rem, calc(100% - 1rem))" : "calc(100% - 1rem)", visibility: "hidden" }}
    >
      {editor && editor.itemId === selection?.id && (
        <div data-inline-text-tools className="flex shrink-0 items-center gap-2"
          onMouseDown={(event) => {
            if (event.target instanceof Element && event.target.closest("button")) event.preventDefault();
          }}>
          {formatFields(editor.format, editor.apply, "center", true).map((field) => <ItemPropertyControl key={field.label} field={field} />)}
        </div>
      )}
      {properties.fields.map((field) => <ItemPropertyControl key={field.label} field={field} />)}
      {isPage
        ? <PageItemActions key={selection.id} itemId={selection.id} deleteButton={deleteButton} />
        : deleteButton}
    </div>
  );
}
