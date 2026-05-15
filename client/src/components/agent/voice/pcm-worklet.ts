declare const AudioWorkletProcessor: {
  new (): { readonly port: MessagePort; process(inputs: Float32Array[][]): boolean };
};
declare function registerProcessor(name: string, ctor: unknown): void;

// AudioWorklet processor: converts Float32 mic samples to Int16 PCM
// and posts ArrayBuffers to the main thread for transmission over the
// voice WebSocket. Runs on the audio thread (separate from the main
// thread), so it gets stable low-latency execution regardless of UI work.
//
// Loaded at runtime via `audioContext.audioWorklet.addModule(workletUrl)`.
// The matching worklet name "pcm-worklet" is referenced by the hook.

class PCMWorkletProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0]?.[0];
    if (!input || input.length === 0) return true;

    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      // Clamp to [-1, 1] then scale to Int16 range. Use 0x8000 for the
      // negative side and 0x7fff for positive (standard PCM convention).
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    // Transfer ownership so the post is cheap (no copy).
    this.port.postMessage(buffer, [buffer]);
    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorkletProcessor);

// Without an export, TS may treat the file as a script (not a module);
// the explicit empty export makes it a module so `import` works in tests.
export {};
