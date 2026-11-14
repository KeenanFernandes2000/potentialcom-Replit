// scripts/ayla-voice-test/serve.ts: bun scripts/ayla-voice-test/serve.ts → http://localhost:5050 (dev only).
const root = new URL(".", import.meta.url).pathname;
const built = await Bun.build({ entrypoints: [`${root}main.ts`], target: "browser", format: "esm" });
if (!built.success) {
  for (const l of built.logs) console.error(l);
  process.exit(1);
}
const js = await built.outputs[0]!.text();
const html = await Bun.file(`${root}index.html`).text();
Bun.serve({
  port: 5050,
  hostname: "localhost",
  fetch(req) {
    const p = new URL(req.url).pathname;
    if (p === "/") return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    if (p === "/main.js") return new Response(js, { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
    return new Response("not found", { status: 404 });
  },
});
console.log("Ayla voice test page: http://localhost:5050 (the origin must be in AYLA_VOICE_ALLOWED_ORIGINS)");
