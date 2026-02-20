import { io, Socket } from "socket.io-client";
import { DrawLine } from "../domain/types";

type Handlers = {
  onDrawLine?: (line: DrawLine) => void;
};

export class BoardSocket {
  private socket: Socket;

  constructor(
    baseUrl: string,
    private handlers: Handlers = {},
  ) {
    this.socket = io(baseUrl, { transports: ["websocket"] });
    this.socket.on("draw-line", (line: DrawLine) =>
      this.handlers.onDrawLine?.(line),
    );
  }

  emitDrawLine(line: DrawLine) {
    this.socket.emit("draw-line", line);
  }

  destroy() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}
