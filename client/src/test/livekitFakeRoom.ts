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
 *
 * To make the next Room.connect() reject:
 *   FakeRoom.nextConnectError = new Error("connect failed");
 *   // restore: FakeRoom.nextConnectError = null after the test
 *
 * To make the next Room.localParticipant.enableMicrophone() reject:
 *   FakeRoom.nextEnableMicError = new Error("Permission denied");
 *   // restore: FakeRoom.nextEnableMicError = null after the test
 */

type Listener = (...args: any[]) => void;

export class FakeRoom {
  static instances: FakeRoom[] = [];

  /**
   * If set, the next constructed instance's connect() will reject with
   * this error (once). Cleared after use.
   */
  static nextConnectError: Error | null = null;

  /**
   * If set, the next constructed instance's setMicrophoneEnabled(true) will
   * reject with this error (once). Cleared after use.
   */
  static nextEnableMicError: Error | null = null;

  private listeners: Record<string, Listener[]> = {};

  // Public mocks (vitest stubs the hook can spy on).
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;

  localParticipant: {
    setMicrophoneEnabled: ReturnType<typeof vi.fn>;
  };

  // The hook spies on this URL to assert the connect target.
  lastConnectArgs: { url?: string; token?: string } = {};

  constructor() {
    FakeRoom.instances.push(this);

    // Consume once-errors set by tests.
    const connectError = FakeRoom.nextConnectError;
    FakeRoom.nextConnectError = null;
    const enableMicError = FakeRoom.nextEnableMicError;
    FakeRoom.nextEnableMicError = null;

    this.connect = vi.fn(async (url: string, token: string) => {
      this.lastConnectArgs = { url, token };
      if (connectError) throw connectError;
    });

    this.disconnect = vi.fn().mockResolvedValue(undefined);

    this.localParticipant = {
      setMicrophoneEnabled: enableMicError
        ? vi.fn().mockRejectedValue(enableMicError)
        : vi.fn().mockResolvedValue(undefined),
    };
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
  FakeRoom.nextConnectError = null;
  FakeRoom.nextEnableMicError = null;
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
