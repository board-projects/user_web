import { io, type Socket } from "socket.io-client";
import { applyBoardChanges, changeKey, EMPTY_BOARD } from "../domain/boardSync";
import type { BoardChange, BoardContent, BoardUpdate } from "../domain/boardSync";

export type BoardSyncStatus = "connecting" | "connected" | "offline";
type Handlers = {
  onContent: (content: BoardContent) => void;
  onStatus: (status: BoardSyncStatus) => void;
};

type JoinAck = ({ ok: true } & BoardUpdate) | { ok: false };
type PatchAck = { ok: true; revision: number; applied: boolean } | { ok: false };
type Patch = { clientId: string; sequence: number; changes: BoardChange[] };

const BATCH_WAIT_MS = 40;
const ACK_TIMEOUT_MS = 8000;
const MAX_BATCH_BYTES = 500_000;
const MAX_BATCH_ITEMS = 128;

export class BoardSocket {
  private readonly socket: Socket;
  private readonly clientId = crypto.randomUUID();
  private readonly queued = new Map<string, BoardChange>();
  private readonly incoming = new Map<number, BoardChange[]>();
  private board = EMPTY_BOARD;
  private revision = 0;
  private sequence = 0;
  private epoch = 0;
  private ready = false;
  private sending = false;
  private pending: Patch | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private retry: ReturnType<typeof setTimeout> | undefined;

  constructor(baseUrl: string | undefined, reference: string, private readonly handlers: Handlers) {
    const origin = new URL(baseUrl || "https://back.dequizma.com", window.location.origin);
    this.socket = io(new URL("/board", origin).href, { autoConnect: false, auth: { reference } });

    this.socket.on("connect", this.join);
    this.socket.on("disconnect", this.disconnected);
    this.socket.on("connect_error", () => {
      handlers.onStatus("offline");
      if (!this.socket.active) this.reconnect();
    });
    this.socket.on("board:update", ({ revision, changes }: BoardUpdate) => this.receive(revision, changes));
    this.socket.connect();
  }

  queue(changes: readonly BoardChange[]) {
    for (const change of changes) this.queued.set(changeKey(change), change);
    this.scheduleFlush();
  }

  destroy() {
    this.epoch++;
    this.ready = false;
    clearTimeout(this.timer);
    clearTimeout(this.retry);
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  private readonly disconnected = () => {
    this.epoch++;
    this.ready = false;
    this.sending = false;
    this.incoming.clear();
    this.handlers.onStatus("offline");
  };

  private readonly join = async () => {
    const epoch = ++this.epoch;
    this.handlers.onStatus("connecting");

    try {
      const reply: JoinAck = await this.socket.timeout(ACK_TIMEOUT_MS).emitWithAck("board:join", {});
      if (epoch !== this.epoch) return;
      if (!reply.ok) {
        this.reconnect();
        return;
      }

      this.board = applyBoardChanges(EMPTY_BOARD, reply.changes);
      this.revision = reply.revision;
      for (const revision of this.incoming.keys()) {
        if (revision <= this.revision) this.incoming.delete(revision);
      }
      this.ready = true;
      this.handlers.onStatus("connected");
      this.publish();
      this.scheduleFlush();
    } catch {
      if (epoch === this.epoch) this.reconnect();
    }
  };

  private reconnect() {
    this.socket.disconnect();
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.socket.connect(), 1500);
  }

  private receive(revision: number, changes: BoardChange[]) {
    if (revision <= this.revision && this.ready) return;
    this.incoming.set(revision, changes);
    if (this.ready) this.publish();
  }

  private publish() {
    while (this.incoming.has(this.revision + 1)) {
      const revision = this.revision + 1;
      this.board = applyBoardChanges(this.board, this.incoming.get(revision)!);
      this.incoming.delete(revision);
      this.revision = revision;
    }
    const optimistic = [...(this.pending?.changes ?? []), ...this.queued.values()];
    this.handlers.onContent(applyBoardChanges(this.board, optimistic));
  }

  private scheduleFlush() {
    if (!this.ready || this.sending || this.timer || (!this.pending && !this.queued.size)) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.flush();
    }, BATCH_WAIT_MS);
  }

  private takeBatch(): Patch {
    const changes: BoardChange[] = [];
    const encoder = new TextEncoder();
    let bytes = 0;
    for (const [key, change] of this.queued) {
      const size = encoder.encode(JSON.stringify(change)).byteLength;
      if (changes.length && (bytes + size > MAX_BATCH_BYTES || changes.length >= MAX_BATCH_ITEMS)) break;
      changes.push(change);
      bytes += size;
      this.queued.delete(key);
    }
    return { clientId: this.clientId, sequence: ++this.sequence, changes };
  }

  private async flush() {
    if (!this.ready || this.sending || (!this.pending && !this.queued.size)) return;
    const patch = this.pending ?? this.takeBatch();
    this.pending = patch;
    this.sending = true;
    const epoch = this.epoch;

    try {
      const reply: PatchAck = await this.socket.timeout(ACK_TIMEOUT_MS).emitWithAck("board:patch", patch);
      if (epoch !== this.epoch) return;
      if (!reply.ok) {
        this.reconnect();
        return;
      }

      this.pending = null;
      this.sending = false;
      if (reply.applied && reply.revision > this.revision) {
        this.incoming.set(reply.revision, patch.changes);
      }
      this.publish();
      if (reply.revision > this.revision) {
        this.reconnect();
        return;
      }
      this.scheduleFlush();
    } catch {
      if (epoch === this.epoch) this.reconnect();
    }
  }
}
