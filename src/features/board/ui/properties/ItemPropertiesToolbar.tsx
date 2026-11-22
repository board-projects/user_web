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

const PHONE_VIEWPORT = "(max-width: 639px)";

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

    const phone = window.matchMedia(PHONE_VIEWPORT);
    let frame = 0;
    const position = () => {
      frame = 0;
      if (phone.matches) {
        toolbar.style.removeProperty("left");
        toolbar.style.removeProperty("top");
        toolbar.style.visibility = "visible";
        return;
      }

      const bounds = board.getBoundingClientRect();
      const item = (anchor.querySelector("[data-board-rotated-frame]") ?? anchor).getBoundingClientRect();
      const handle = anchor.querySelector("[data-rotation-handle]")?.getBoundingClientRect();
      if (item.right < bounds.left || item.left > bounds.right ||
          item.bottom < bounds.top || item.top > bounds.bottom) {
        toolbar.style.visibility = "hidden";
        return;
      }

      const { left, top } = getPropertiesToolbarPosition(
        bounds,
        handle ? { left: item.left, right: item.right, top: Math.min(item.top, handle.top), bottom: Math.max(item.bottom, handle.bottom) } : item,
        toolbar.getBoundingClientRect(), isPage ? "right" : "above",
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

    phone.addEventListener("change", schedule);
    const unsubscribe = useBoardStore.subscribe(schedule);
    position();

    return () => {
      cancelAnimationFrame(frame);
      phone.removeEventListener("change", schedule);
      resize.disconnect();
      movement.disconnect();
      unsubscribe();
    };
  }, [anchorSelector, isPage, viewport]);

  if (!properties || !anchorSelector) return null;

  const inlineEditor = editor && editor.itemId === selection?.id ? editor : null;
  const canEditInline = selection?.type === "shape" || selection?.type === "table";
  const textFields = inlineEditor
    ? formatFields(inlineEditor.format, inlineEditor.apply, "center", true)
    : properties.textFields ?? (canEditInline ? formatFields(undefined, () => {}) : undefined);

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
      className={`absolute inset-x-2 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+3.5rem)] z-[70] flex flex-col rounded-xl border border-stone-200 bg-white shadow-lg sm:inset-x-auto sm:bottom-auto ${
        isPage
          ? "max-h-[min(45dvh,21rem)] gap-2 overflow-y-auto p-1.5 [overflow-wrap:anywhere] [&>label]:justify-between sm:max-h-[calc(100%-1rem)] sm:w-max sm:max-w-[min(14rem,calc(100%-1rem))]"
          : "overflow-hidden whitespace-nowrap sm:w-max sm:max-w-[calc(100%-1rem)]"
      }`}
      style={{ visibility: "hidden" }}
    >
      {isPage ? (
        <>
          {properties.fields.map((field) => <ItemPropertyControl key={field.label} field={field} />)}
          <PageItemActions key={selection.id} itemId={selection.id} deleteButton={deleteButton} />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto px-2 py-1.5">
            {properties.fields.map((field) => <ItemPropertyControl key={field.label} field={field} />)}
            {deleteButton}
          </div>
          {textFields && (
            <div data-inline-text-tools role="group" aria-label="Text formatting"
              className="overflow-x-auto border-t border-stone-200 bg-stone-50/70"
              onMouseDown={(event) => {
                if (inlineEditor && event.target instanceof Element && event.target.closest("button")) event.preventDefault();
              }}>
              <fieldset disabled={canEditInline && !inlineEditor}
                className="flex w-max min-w-full items-center gap-1.5 px-2 py-1.5 disabled:opacity-50">
                {textFields.map((field) => <ItemPropertyControl key={field.label} field={field} compact />)}
              </fieldset>
            </div>
          )}
        </>
      )}
    </div>
  );
}
