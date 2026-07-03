// jsdom does not provide the encoding/streams globals that the SDK's streaming
// code (and the specs exercising it) use at runtime. Node's implementations
// are spec-compatible, so install them before test modules load.
const { TextEncoder, TextDecoder } = require("node:util");
const { ReadableStream } = require("node:stream/web");

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}
if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream = ReadableStream;
}
