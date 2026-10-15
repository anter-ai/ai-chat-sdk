"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useStickyBottom(containerRef?: React.RefObject<HTMLElement | null>) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === "undefined") return;

    const root = containerRef?.current ?? anchor.closest<HTMLElement>(".ais-messages");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsAtBottom(entry.isIntersecting);
      },
      { root: root ?? null, threshold: 0, rootMargin: "0px 0px 80px 0px" },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [containerRef]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    anchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  return { anchorRef, isAtBottom, scrollToBottom };
}
