import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { supportsDvh, useViewportHeightFallback } from "./use-viewport-height";

type Listener = () => void;

function stubCss(dvhSupported: boolean) {
  Object.defineProperty(globalThis, "CSS", {
    value: { supports: jest.fn(() => dvhSupported) },
    configurable: true,
    writable: true,
  });
}

function stubVisualViewport(height: number) {
  const listeners = new Set<Listener>();
  const viewport = {
    height,
    addEventListener: jest.fn((_type: string, cb: Listener) => listeners.add(cb)),
    removeEventListener: jest.fn((_type: string, cb: Listener) => listeners.delete(cb)),
    emitResize(nextHeight: number) {
      this.height = nextHeight;
      listeners.forEach((cb) => cb());
    },
  };
  Object.defineProperty(window, "visualViewport", {
    value: viewport,
    configurable: true,
    writable: true,
  });
  return viewport;
}

describe("use-viewport-height", () => {
  const originalCss = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  const originalViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");

  afterEach(() => {
    if (originalCss) Object.defineProperty(globalThis, "CSS", originalCss);
    if (originalViewport) Object.defineProperty(window, "visualViewport", originalViewport);
    else Reflect.deleteProperty(window, "visualViewport");
  });

  it("supportsDvh reflects CSS.supports", () => {
    stubCss(true);
    expect(supportsDvh()).toBe(true);
    stubCss(false);
    expect(supportsDvh()).toBe(false);
  });

  it("is a no-op when dvh is supported (CSS owns the variable)", () => {
    stubCss(true);
    const viewport = stubVisualViewport(600);
    const ref = createRef<HTMLElement | null>();
    (ref as { current: HTMLElement | null }).current = document.createElement("div");

    renderHook(() => useViewportHeightFallback(ref));

    expect(viewport.addEventListener).not.toHaveBeenCalled();
    expect(ref.current!.style.getPropertyValue("--ais-viewport-height")).toBe("");
  });

  it("mirrors the visual viewport height into --ais-viewport-height when dvh is unsupported", () => {
    stubCss(false);
    const viewport = stubVisualViewport(640);
    const ref = createRef<HTMLElement | null>();
    const el = document.createElement("div");
    (ref as { current: HTMLElement | null }).current = el;

    const { unmount } = renderHook(() => useViewportHeightFallback(ref));

    expect(el.style.getPropertyValue("--ais-viewport-height")).toBe("640px");

    viewport.emitResize(512);
    expect(el.style.getPropertyValue("--ais-viewport-height")).toBe("512px");

    unmount();
    expect(viewport.removeEventListener).toHaveBeenCalled();
    expect(el.style.getPropertyValue("--ais-viewport-height")).toBe("");
  });
});
