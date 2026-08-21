import { act, renderHook } from "@testing-library/react";
import { isKeyboardOpen, overlayHeight, useVisualViewport } from "./use-visual-viewport";

type Listener = () => void;

function stubVisualViewport(height: number, offsetTop = 0) {
  const listeners = new Map<string, Set<Listener>>();
  const viewport = {
    height,
    offsetTop,
    addEventListener: jest.fn((type: string, cb: Listener) => {
      const set = listeners.get(type) ?? new Set<Listener>();
      set.add(cb);
      listeners.set(type, set);
    }),
    removeEventListener: jest.fn((type: string, cb: Listener) => {
      listeners.get(type)?.delete(cb);
    }),
    emit(type: string, next: { height?: number; offsetTop?: number }) {
      if (next.height !== undefined) this.height = next.height;
      if (next.offsetTop !== undefined) this.offsetTop = next.offsetTop;
      listeners.get(type)?.forEach((cb) => cb());
    },
  };
  Object.defineProperty(window, "visualViewport", {
    value: viewport,
    configurable: true,
    writable: true,
  });
  return viewport;
}

describe("useVisualViewport", () => {
  const original = Object.getOwnPropertyDescriptor(window, "visualViewport");

  afterEach(() => {
    if (original) Object.defineProperty(window, "visualViewport", original);
    else Reflect.deleteProperty(window, "visualViewport");
  });

  it("tracks height and offsetTop and updates on resize", () => {
    const viewport = stubVisualViewport(800, 0);
    const { result } = renderHook(() => useVisualViewport());
    expect(result.current).toEqual({ height: 800, offsetTop: 0 });

    act(() => {
      viewport.emit("resize", { height: 420, offsetTop: 0 });
    });
    expect(result.current).toEqual({ height: 420, offsetTop: 0 });
  });
});

describe("overlayHeight / isKeyboardOpen", () => {
  const originalInnerHeight = window.innerHeight;
  let input: HTMLInputElement | undefined;

  const focusEditable = () => {
    input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
  };

  afterEach(() => {
    input?.remove();
    input = undefined;
    Object.defineProperty(window, "innerHeight", {
      value: originalInnerHeight,
      configurable: true,
    });
  });

  it("treats a much-shorter visual viewport as the keyboard while a field is focused", () => {
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    focusEditable();
    expect(isKeyboardOpen({ height: 420, offsetTop: 0 })).toBe(true);
    expect(isKeyboardOpen({ height: 800, offsetTop: 0 })).toBe(false);
  });

  // Regression: on iOS Safari `window.innerHeight` is the *large* viewport, so
  // with the toolbars shown visualViewport is already ~100-150px shorter with
  // no keyboard. A height-only test read that as "keyboard open" and flipped
  // as the toolbars collapsed/expanded on scroll, snapping the pinned drawer
  // open and shut.
  it("never reports the keyboard when nothing editable is focused", () => {
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    document.body.focus();
    expect(isKeyboardOpen({ height: 420, offsetTop: 0 })).toBe(false);
    expect(isKeyboardOpen({ height: 660, offsetTop: 0 })).toBe(false);
    expect(isKeyboardOpen({ height: 800, offsetTop: 0 })).toBe(false);
  });

  it("ignores browser-chrome-sized shrinkage even with a field focused", () => {
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    focusEditable();
    // 140px occluded is toolbars, not a keyboard: under max(150, 25% of 800).
    expect(isKeyboardOpen({ height: 660, offsetTop: 0 })).toBe(false);
  });

  it("extends by the home-indicator inset only when the keyboard is closed", () => {
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    expect(overlayHeight(null)).toBe("100dvh");
    expect(overlayHeight({ height: 800, offsetTop: 0 })).toBe(
      "calc(800px + env(safe-area-inset-bottom, 0px))",
    );
    focusEditable();
    expect(overlayHeight({ height: 420, offsetTop: 0 })).toBe(420);
  });
});

describe("useVisualViewport enabled flag", () => {
  const original = Object.getOwnPropertyDescriptor(window, "visualViewport");

  afterEach(() => {
    if (original) Object.defineProperty(window, "visualViewport", original);
    else Reflect.deleteProperty(window, "visualViewport");
  });

  it("does not subscribe when disabled", () => {
    const viewport = stubVisualViewport(800, 0);
    const { result } = renderHook(() => useVisualViewport(false));
    expect(result.current).toBeNull();
    expect(viewport.addEventListener).not.toHaveBeenCalled();
  });
});
