import { useBoardStore } from "../store/board.store";
import { BoardViewport } from "./BoardViewport";

export function PageBackgrounds() {
  const pages = useBoardStore((state) => state.sheets);
  if (!pages.length) return null;

  return (
    <BoardViewport background>
      {pages.map((page) => (
        <div
          key={page.id}
          aria-hidden="true"
          className="absolute"
          style={{
            left: page.x,
            top: page.y,
            width: page.width,
            height: page.height,
            backgroundColor: page.backgroundColor ?? "#ffffff",
            backgroundImage: page.dots ? "radial-gradient(circle, #94a3b8 0.8px, transparent 1px)" : undefined,
            backgroundSize: "16px 16px",
          }}
        />
      ))}
    </BoardViewport>
  );
}
