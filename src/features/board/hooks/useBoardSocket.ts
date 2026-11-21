import { drawingId } from "../domain/drawings";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { BoardSocket, type BoardSyncStatus } from "../services/boardSocket";
import { diffBoardContent, reconcileBoardContent } from "../domain/boardSync";
import { useBoardStore } from "../store/board.store";

export function useBoardSocket(baseUrl: string | undefined, reference: string) {
  const socket = useRef<BoardSocket | null>(null);
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
    socket.current = connection;
    const unsubscribe = useBoardStore.subscribe((next, previous) => {
      if (applyingRemote) return;
      const changes = diffBoardContent(previous, next);
      if (changes.length) connection.queue(changes);
    });

    return () => {
      socket.current = null;
      unsubscribe();
      connection.destroy();
    };
  }, [baseUrl, reference]);

  const waitForSync = useCallback(async () => {
    if (!socket.current) throw new Error("Board is connecting");
    await socket.current.waitForSync();
  }, []);

  return { status, waitForSync };
}
