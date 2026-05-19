"use client";

import React from "react";

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="ais-loading-skeleton">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="ais-loading-line" />
      ))}
    </div>
  );
}
