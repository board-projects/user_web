import { drawingId } from "../domain/drawings";
import { useLayoutEffect, useState } from "react";
import { BoardSocket, type BoardSyncStatus } from "../services/boardSocket";
import { diffBoardContent, reconcileBoardContent } from "../domain/boardSync";
import { useBoardStore } from "../store/board.store";

export function useBoardSocket(baseUrl: string | undefined, reference: string) {
  const [status, setStatus] = useState<BoardSyncStatus>("connecting");

  useLayoutEffect(() => {
    let applyingRemote = false;
    const connection = new BoardSocket(baseUrl, reference, {
      onStatus: setStatus,
      onContent: (content) => {
        const current = useBoardStore.getState();
        const patch = reconcileBoardContent(current, content);
        if (!Object.keys(patch).length) return;

        if (patch.lines && current.marqueeSelection?.lines.size) {
          const selectedIds = new Set(Array.from(current.marqueeSelection.lines, drawingId));
          applyingRemote = true;
          useBoardStore.setState({
            ...patch,
            marqueeSelection: {
              ...current.marqueeSelection,
              lines: new Set(patch.lines.filter((line) => selectedIds.has(drawingId(line)))),
            },
          });
        } else {
          applyingRemote = true;
          useBoardStore.setState(patch);
        }
        applyingRemote = false;
      },
    });
    const unsubscribe = useBoardStore.subscribe((next, previous) => {
      if (applyingRemote) return;
      const changes = diffBoardContent(previous, next);
      if (changes.length) connection.queue(changes);
    });

    return () => {
      unsubscribe();
      connection.destroy();
    };
  }, [baseUrl, reference]);

  return { status };
}
