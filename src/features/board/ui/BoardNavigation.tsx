"use client";

import type { RefObject } from "react";
import { FaExpand, FaHandPaper, FaMinus, FaPlus } from "react-icons/fa";
import { fitBoardViewport } from "../domain/boardFit";
import { useBoardStore } from "../store/board.store";

const buttonClass = "grid h-11 w-11 place-items-center rounded-lg hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-blue-600";

export function BoardNavigation({ viewport }: { viewport: RefObject<HTMLElement | null> }) {
  const panMode = useBoardStore((state) => state.panMode);
  const togglePanMode = useBoardStore((state) => state.togglePanMode);

  const changeZoom = (factor: number) => {
    const area = viewport.current;
    if (!area) return;
    const { zoom, zoomAt } = useBoardStore.getState();
    zoomAt(zoom * factor, area.clientWidth / 2, area.clientHeight / 2);
  };

  const fitContent = () => {
    const area = viewport.current;
    if (!area) return;
    useBoardStore.setState(fitBoardViewport(useBoardStore.getState(), area.clientWidth, area.clientHeight));
  };

  return (
    <div
      role="group"
      aria-label="Board navigation"
      data-ui="true"
      className="absolute bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+3.5rem)] left-[max(0.75rem,env(safe-area-inset-left))] z-40 flex items-center rounded-xl border border-stone-200 bg-white p-0.5 shadow lg:bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <button type="button" aria-label="Pan board" aria-pressed={panMode} className={`${buttonClass} lg:hidden aria-pressed:bg-blue-100 aria-pressed:text-blue-700`} onClick={togglePanMode}>
        <FaHandPaper aria-hidden="true" />
      </button>
      <button type="button" aria-label="Zoom in" title="Zoom in" className={buttonClass} onClick={() => changeZoom(1.25)}>
        <FaPlus aria-hidden="true" />
      </button>
      <button type="button" aria-label="Zoom out" title="Zoom out" className={buttonClass} onClick={() => changeZoom(1 / 1.25)}>
        <FaMinus aria-hidden="true" />
      </button>
      <button type="button" aria-label="Fit board to screen" title="Fit board to screen" className={buttonClass} onClick={fitContent}>
        <FaExpand aria-hidden="true" />
      </button>
    </div>
  );
}
