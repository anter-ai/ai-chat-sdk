"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useStickyBottom() {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsAtBottom(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "0px 0px 80px 0px" },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    anchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  return { anchorRef, isAtBottom, scrollToBottom };
}
