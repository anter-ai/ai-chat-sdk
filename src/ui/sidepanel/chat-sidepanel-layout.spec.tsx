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

  it("pins to visual viewport when mobile soft keyboard is open", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 390,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 844,
      configurable: true,
    });
    Object.defineProperty(window, "visualViewport", {
      value: {
        height: 450,
        offsetTop: 0,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
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
    expect(root).toHaveClass("ais-mobile", "is-keyboard-open");
  });
});
