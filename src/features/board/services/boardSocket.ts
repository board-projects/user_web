import { io, type Socket } from "socket.io-client";
import type { DrawLine } from "../domain/types";

type Handlers = {
  onDrawLine: (line: DrawLine) => void;
};

export class BoardSocket {
  private readonly socket: Socket;
  private ready = false;

  constructor(baseUrl: string, reference: string, handlers: Handlers) {
    const origin = new URL(baseUrl || "/", window.location.origin);
    const namespace = new URL("/board", origin);
    this.socket = io(namespace.href, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { reference },
    });

    this.socket.on("board-ready", () => { this.ready = true; });
    this.socket.on("disconnect", () => { this.ready = false; });
    this.socket.on("draw-line", handlers.onDrawLine);
    this.socket.connect();
  }

  emitDrawLine(line: DrawLine) {
    if (this.ready && this.socket.connected) this.socket.emit("draw-line", line);
  }

  destroy() {
    this.ready = false;
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}
