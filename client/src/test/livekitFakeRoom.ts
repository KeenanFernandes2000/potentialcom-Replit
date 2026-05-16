import { vi } from "vitest";

/**
 * Test double for `livekit-client`'s `Room`. Exposes only the surface the
 * hook actually uses: connect, disconnect, on(event, cb), and
 * localParticipant.{enableMicrophone, setMicrophoneEnabled}. Tests trigger
 * events via the helper methods (`triggerDataReceived`, `triggerTrackSubscribed`,
 * `triggerDisconnected`).
 *
 * Usage in a test:
 *
 *   import { installFakeRoom, getLastFakeRoom } from "./test/livekitFakeRoom";
 *
 *   beforeEach(() => { installFakeRoom(); });
 *   // ... render the hook, click start ...
 *   const room = getLastFakeRoom();
 *   room.triggerDataReceived({ type: "transcript", text: "hi" });
 */

type Listener = (...args: any[]) => void;

export class FakeRoom {
  static instances: FakeRoom[] = [];

  private listeners: Record<string, Listener[]> = {};

  // Public mocks (vitest stubs the hook can spy on).
  connect = vi.fn().mockResolvedValue(undefined);
  disconnect = vi.fn().mockResolvedValue(undefined);

  localParticipant = {
    enableMicrophone: vi.fn().mockResolvedValue(undefined),
    setMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
  };

  // The hook spies on this URL to assert the connect target.
  lastConnectArgs: { url?: string; token?: string } = {};

  constructor() {
    FakeRoom.instances.push(this);
    // Capture connect arguments for assertions.
    const origConnect = this.connect.bind(this);
    this.connect = vi.fn(async (url: string, token: string) => {
      this.lastConnectArgs = { url, token };
      return origConnect();
    });
  }

  on(event: string, cb: Listener): this {
    (this.listeners[event] ||= []).push(cb);
    return this;
  }

  off(event: string, cb: Listener): this {
    this.listeners[event] = (this.listeners[event] || []).filter((l) => l !== cb);
    return this;
  }

  // ---- helpers tests use to fire events ------------------------------

  triggerDataReceived(payload: object): void {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    for (const l of this.listeners["dataReceived"] || []) l(bytes);
  }

  triggerTrackSubscribed(kind: "audio" | "video" = "audio"): void {
    const track = {
      kind,
      attach: vi.fn(),
      detach: vi.fn(),
    };
    for (const l of this.listeners["trackSubscribed"] || []) l(track);
  }

  triggerDisconnected(): void {
    for (const l of this.listeners["disconnected"] || []) l();
  }
}

/**
 * Install FakeRoom in place of livekit-client's Room. Call inside beforeEach
 * so each test gets a fresh instances list.
 */
export function installFakeRoom(): void {
  FakeRoom.instances = [];
  vi.doMock("livekit-client", async () => {
    const actual = await vi.importActual<any>("livekit-client");
    return {
      ...actual,
      Room: FakeRoom,
      // Re-export the enums the hook references. The hook uses string
      // values directly (RoomEvent.DataReceived → "dataReceived"), so the
      // real enums work in tests too — no replacement needed.
    };
  });
}

export function getLastFakeRoom(): FakeRoom {
  const last = FakeRoom.instances[FakeRoom.instances.length - 1];
  if (!last) throw new Error("No FakeRoom instances yet — did you call installFakeRoom() and trigger a connect?");
  return last;
}
