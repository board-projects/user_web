import { useEffect, useRef } from "react";
import { BoardSocket } from "../services/boardSocket";
import { DrawLine } from "../domain/types";

export function useBoardSocket(opts: {
  baseUrl: string;
  onDrawLine: (line: DrawLine) => void;
}) {
  const ref = useRef<BoardSocket | null>(null);

  useEffect(() => {
    ref.current = new BoardSocket(opts.baseUrl, {
      onDrawLine: opts.onDrawLine,
    });
    return () => ref.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.baseUrl]);

  return {
    emitDrawLine: (line: DrawLine) => ref.current?.emitDrawLine(line),
  };
}
