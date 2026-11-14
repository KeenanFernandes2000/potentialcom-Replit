// client/src/lib/aylaVoice/sse.ts
import { parseServerEvent, type ServerEvent } from "./protocol";

// The /voice/events stream: blocks split by a blank line, "data:" lines joined,
// ":" comments (pings) ignored, each payload checked by parseServerEvent.

export function createEventParser(onEvent: (e: ServerEvent) => void): { push(chunk: string): void; end(): void } {
  let buf = "";
  const flush = (block: string) => {
    const data = block
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).replace(/^ /, ""))
      .join("\n");
    if (!data) return;
    try {
      const e = parseServerEvent(JSON.parse(data));
      if (e) onEvent(e);
    } catch {
      /* not a JSON frame: ignored */
    }
  };
  return {
    push(chunk) {
      buf += chunk.replace(/\r\n/g, "\n");
      let i = buf.indexOf("\n\n");
      while (i >= 0) {
        flush(buf.slice(0, i));
        buf = buf.slice(i + 2);
        i = buf.indexOf("\n\n");
      }
    },
    end() {
      if (buf.trim()) flush(buf);
      buf = "";
    },
  };
}
