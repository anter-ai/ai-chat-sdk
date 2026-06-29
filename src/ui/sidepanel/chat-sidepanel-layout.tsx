"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../primitives/resizable-handle";

export interface ChatSidepanelLayoutProps {
  /** Renders the main host application view on the left. */
  children: React.ReactNode;
  /** Renders the panel view on the right (typically <ChatSidepanel>). */
  sidepanel: React.ReactNode;
  /** Controls whether the side panel pane is expanded or collapsed. */
  isOpen: boolean;
  /** Callback called when the user collapses the panel (handle/close/backdrop). */
  onClose: () => void;

  /** Percentage-based default width of sidepanel (0-100). Defaults to 30. */
  defaultWidth?: number;
  /** Percentage-based minimum width of sidepanel (0-100). Defaults to 20. */
  minWidth?: number;
  /** Percentage-based maximum width of sidepanel (0-100). Defaults to 50. */
  maxWidth?: number;

  /** Key for persisting user-dragged widths in localStorage. */
  storageKey?: string;
  /** Optional classes for the outer wrapper. */
  className?: string;
}

const SIDEBAR_OVERLAY_BREAKPOINT_PX = 1024;

const getSafeLayout = (storageKey: string): Record<string, number> | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : undefined;
  } catch (e) {
    return undefined;
  }
};

export function ChatSidepanelLayout({
  children,
  sidepanel,
  isOpen,
  onClose,
  defaultWidth = 30,
  minWidth = 20,
  maxWidth = 50,
  storageKey = "ais-sidepanel-layout",
  className = "",
}: ChatSidepanelLayoutProps) {
  // Lazily detect mobile viewport
  const [isOverlayViewport, setIsOverlayViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setIsOverlayViewport(window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Manual persistence of layout state with crash safety
  const [savedLayout, setSavedLayout] = useState<Record<string, number> | undefined>(() =>
    getSafeLayout(storageKey),
  );

  const handleLayoutChanged = useCallback(
    (layout: Record<string, number>) => {
      // Only persist real desktop drag layouts. In overlay/mobile mode the
      // sidepanel pane is lifted out of flow via CSS, so the layout the lib
      // reports is degenerate and must not pollute the saved desktop split.
      if (!isOpen || isOverlayViewport || typeof window === "undefined") return;

      const layoutKeys = Object.keys(layout);
      const isSame =
        savedLayout &&
        layoutKeys.length === Object.keys(savedLayout).length &&
        layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedLayout[k] ?? 0)) < 0.01);
      if (isSame) return;

      setSavedLayout(layout);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(layout));
      } catch (e) {
        // Ignore storage write errors
      }
    },
    [isOpen, isOverlayViewport, savedLayout, storageKey],
  );

  useEffect(() => {
    setSavedLayout(getSafeLayout(storageKey));
  }, [storageKey]);

  // Focus trap / Keyboard accessibility management
  const sidepanelRef = useRef<HTMLDivElement | null>(null);
  const prevOpenRef = useRef(false);

  const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!isOpen || !isOverlayViewport) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isOverlayViewport, onClose]);

  const handleMobileKeyDown = (e: React.KeyboardEvent) => {
    if (!isOverlayViewport) return;
    if (e.key === "Tab" && sidepanelRef.current) {
      const focusable = sidepanelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  // Autofocus only on a genuine open transition (false -> true) while in overlay
  // mode. Keying off the transition (not just current state) prevents focus from
  // being yanked into the panel when the user merely resizes across the breakpoint.
  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (!justOpened || !isOverlayViewport) return;
    const node = sidepanelRef.current;
    if (!node) return;
    const firstFocusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0];
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      node.focus();
    }
  }, [isOpen, isOverlayViewport]);

  const sidepanelSize = savedLayout?.["sidepanel"] ?? defaultWidth;
  const hostSize = savedLayout?.["host"] ?? 100 - defaultWidth;

  // Single DOM tree keeps React node path identical to avoid state teardown during viewport resize
  return (
    <div
      className={`ais-sidepanel-layout-root ${
        isOverlayViewport ? "ais-mobile" : "ais-desktop"
      } ${className}`}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      <ResizablePanelGroup
        orientation="horizontal"
        className="ais-sidepanel-layout-container"
        defaultLayout={savedLayout}
        onLayoutChanged={handleLayoutChanged}
      >
        <ResizablePanel
          id="host"
          key="host"
          defaultSize={hostSize}
          minSize={100 - maxWidth}
          className="ais-sidepanel-host-pane"
        >
          {children}
        </ResizablePanel>

        {/* Handle is rendered whenever the panel is open so the lib's panel/
            separator structure stays consistent; it is hidden via CSS in overlay
            mode where the sidepanel is a fixed drawer rather than a split pane. */}
        {isOpen && <ResizableHandle withHandle className="ais-sidepanel-resize-handle" />}

        {isOpen && (
          <ResizablePanel
            id="sidepanel"
            key="sidepanel"
            defaultSize={sidepanelSize}
            minSize={minWidth}
            maxSize={maxWidth}
            className="ais-sidepanel-chat-pane"
            role={isOverlayViewport ? "dialog" : undefined}
            aria-modal={isOverlayViewport ? "true" : undefined}
            aria-label={isOverlayViewport ? "AI Assistant Panel" : undefined}
            tabIndex={isOverlayViewport ? -1 : undefined}
            elementRef={sidepanelRef}
            onKeyDown={handleMobileKeyDown}
          >
            {sidepanel}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      {isOpen && isOverlayViewport && (
        <div className="ais-mobile-sidebar-backdrop" onClick={onClose} style={{ zIndex: 140 }} />
      )}
    </div>
  );
}
