"use client";

import { useState, type ComponentProps } from "react";
import { Rnd } from "react-rnd";
import { getPageResizeSnap, PAGE_RESIZE_SNAP_GAP, type ResizeSnap } from "../domain/pageSnap";
import { useBoardStore } from "../store/board.store";

type Props = ComponentProps<typeof Rnd>;

export function BoardResizable({ onResizeStart, onResizeStop, position, size, ...props }: Props) {
  const [snap, setSnap] = useState<ResizeSnap>();

  const start: Props["onResizeStart"] = (event, direction, element) => {
    if (onResizeStart?.(event, direction, element) === false) return false;
    if (!position || typeof size?.width !== "number" || typeof size.height !== "number") return;

    setSnap(getPageResizeSnap(
      { ...position, width: size.width, height: size.height },
      direction,
      useBoardStore.getState().sheets,
      props["data-board-connectable-id"],
      props,
    ));
  };

  const stop: Props["onResizeStop"] = (...args) => {
    setSnap(undefined);
    onResizeStop?.(...args);
  };

  return (
    <Rnd
      {...props}
      position={position}
      size={size}
      snap={snap}
      snapGap={PAGE_RESIZE_SNAP_GAP}
      onResizeStart={start}
      onResizeStop={stop}
    />
  );
}
