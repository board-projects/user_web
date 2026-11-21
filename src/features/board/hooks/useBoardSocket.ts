import { useCallback, useLayoutEffect, useRef } from "react";
import { BoardSocket } from "../services/boardSocket";
import type { DrawLine } from "../domain/types";

export function useBoardSocket({
  baseUrl,
  reference,
  onDrawLine,
}: {
  baseUrl: string;
  reference: string;
  onDrawLine: (line: DrawLine) => void;
}) {
  const socket = useRef<BoardSocket | null>(null);

  useLayoutEffect(() => {
    const connection = new BoardSocket(baseUrl, reference, { onDrawLine });
    socket.current = connection;
    return () => {
      socket.current = null;
      connection.destroy();
    };
  }, [baseUrl, reference, onDrawLine]);

  const emitDrawLine = useCallback((line: DrawLine) => socket.current?.emitDrawLine(line), []);
  return { emitDrawLine };
}
