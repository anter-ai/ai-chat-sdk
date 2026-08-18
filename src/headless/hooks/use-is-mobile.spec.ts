import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./use-is-mobile";

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mq = {
    matches,
    media: "",
    addEventListener: jest.fn((_type: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners.add(cb);
    }),
    removeEventListener: jest.fn((_type: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners.delete(cb);
    }),
    emit(next: boolean) {
      this.matches = next;
      listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent));
    },
  };
  window.matchMedia = jest.fn().mockReturnValue(mq);
  return mq;
}

describe("useIsMobile", () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it("is true below 768 and false at or above", () => {
    stubMatchMedia(true);
    const mobile = renderHook(() => useIsMobile());
    expect(mobile.result.current).toBe(true);

    stubMatchMedia(false);
    const desktop = renderHook(() => useIsMobile());
    expect(desktop.result.current).toBe(false);
  });
});
