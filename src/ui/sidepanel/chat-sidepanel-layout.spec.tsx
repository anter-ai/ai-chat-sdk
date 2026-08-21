import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatSidepanelLayout } from "./chat-sidepanel-layout";

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("ChatSidepanelLayout", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeAll(() => {
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterAll(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: originalInnerHeight,
      configurable: true,
    });
  });

  it("renders desktop split view when width > 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      configurable: true,
    });

    const { container } = render(
      <ChatSidepanelLayout
        isOpen={true}
        onClose={jest.fn()}
        sidepanel={<div data-testid="sidepanel-content">Sidepanel</div>}
      >
        <div>Main content</div>
      </ChatSidepanelLayout>,
    );

    const root = container.querySelector(".ais-sidepanel-layout-root");
    expect(root).toHaveClass("ais-desktop", "ais-panel-open");
    expect(root).not.toHaveClass("ais-mobile");
    expect(screen.getByTestId("sidepanel-content")).toBeInTheDocument();
  });

  it("renders mobile overlay drawer when width <= 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 390,
      configurable: true,
    });

    const { container } = render(
      <ChatSidepanelLayout
        isOpen={true}
        onClose={jest.fn()}
        sidepanel={<div data-testid="sidepanel-content">Sidepanel</div>}
      >
        <div>Main content</div>
      </ChatSidepanelLayout>,
    );

    const root = container.querySelector(".ais-sidepanel-layout-root");
    expect(root).toHaveClass("ais-mobile", "ais-panel-open");
    expect(container.querySelector(".ais-mobile-sidebar-backdrop")).toBeInTheDocument();
  });

  const mockMobileViewport = (visualViewportHeight: number) => {
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
    Object.defineProperty(window, "visualViewport", {
      value: {
        height: visualViewportHeight,
        offsetTop: 0,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });
  };

  it("pins to visual viewport when mobile soft keyboard is open", () => {
    mockMobileViewport(450);

    const { container } = render(
      <ChatSidepanelLayout
        isOpen={true}
        onClose={jest.fn()}
        sidepanel={<input data-testid="composer" autoFocus />}
      >
        <div>Main content</div>
      </ChatSidepanelLayout>,
    );

    const root = container.querySelector(".ais-sidepanel-layout-root");
    expect(root).toHaveClass("ais-mobile", "is-keyboard-open");
  });

  // Regression: `visualViewport` is ~100-150px shorter than `window.innerHeight`
  // on iOS Safari whenever the toolbars are showing, with no keyboard present.
  // Reading that as "keyboard open" pinned inline top/height onto the fixed
  // drawer, and the pin flipped on and off as the toolbars collapsed and
  // expanded during a scroll — the drawer visibly snapped open and shut.
  it("does not pin for browser chrome, even with the composer focused", () => {
    mockMobileViewport(720);

    const { container } = render(
      <ChatSidepanelLayout
        isOpen={true}
        onClose={jest.fn()}
        sidepanel={<input data-testid="composer" autoFocus />}
      >
        <div>Main content</div>
      </ChatSidepanelLayout>,
    );

    const root = container.querySelector(".ais-sidepanel-layout-root");
    expect(root).toHaveClass("ais-mobile");
    expect(root).not.toHaveClass("is-keyboard-open");
    expect(container.querySelector<HTMLElement>(".ais-sidepanel-chat-pane")?.style.top).toBe("");
  });

  it("does not subscribe to the visual viewport while the panel is closed", () => {
    mockMobileViewport(450);
    const vv = window.visualViewport as unknown as { addEventListener: jest.Mock };

    render(
      <ChatSidepanelLayout
        isOpen={false}
        onClose={jest.fn()}
        sidepanel={<input data-testid="composer" />}
      >
        <div>Main content</div>
      </ChatSidepanelLayout>,
    );

    expect(vv.addEventListener).not.toHaveBeenCalled();
  });

  it("preserves children DOM and state without remounting on open/close", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      configurable: true,
    });

    const unmountSpy = jest.fn();
    function HostComponent() {
      React.useEffect(() => {
        return () => unmountSpy();
      }, []);
      return <div data-testid="host-child">Host App Content</div>;
    }

    const { rerender } = render(
      <ChatSidepanelLayout isOpen={true} onClose={jest.fn()} sidepanel={<div>Sidepanel</div>}>
        <HostComponent />
      </ChatSidepanelLayout>,
    );

    expect(screen.getByTestId("host-child")).toBeInTheDocument();
    expect(unmountSpy).not.toHaveBeenCalled();

    // Close panel
    rerender(
      <ChatSidepanelLayout isOpen={false} onClose={jest.fn()} sidepanel={<div>Sidepanel</div>}>
        <HostComponent />
      </ChatSidepanelLayout>,
    );

    expect(screen.getByTestId("host-child")).toBeInTheDocument();
    expect(unmountSpy).not.toHaveBeenCalled();

    // Reopen panel
    rerender(
      <ChatSidepanelLayout isOpen={true} onClose={jest.fn()} sidepanel={<div>Sidepanel</div>}>
        <HostComponent />
      </ChatSidepanelLayout>,
    );

    expect(screen.getByTestId("host-child")).toBeInTheDocument();
    expect(unmountSpy).not.toHaveBeenCalled();
  });
});
