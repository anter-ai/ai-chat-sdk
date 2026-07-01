"use client";

import React, { useEffect, useState } from "react";
import type { MentionTarget } from "../../headless/types/chat";

interface MentionMenuProps {
  query: string;
  activeIndex: number;
  provider?: (query: string) => MentionTarget[] | Promise<MentionTarget[]>;
  onSelect: (target: MentionTarget) => void;
  onActiveIndexChange: (index: number) => void;
  onItemsChange: (items: MentionTarget[]) => void;
  onClose: () => void;
}

export function MentionMenu({
  query,
  activeIndex,
  provider,
  onSelect,
  onActiveIndexChange,
  onItemsChange,
  onClose,
}: MentionMenuProps) {
  const [items, setItems] = useState<MentionTarget[]>([]);

  useEffect(() => {
    let active = true;
    if (!provider) {
      setItems([]);
      return;
    }
    const result = provider(query);
    if (result instanceof Promise) {
      result.then((resolved) => {
        if (active) setItems(resolved);
      });
    } else {
      setItems(result);
    }
    return () => {
      active = false;
    };
  }, [provider, query]);

  useEffect(() => {
    onItemsChange(items);
  }, [items, onItemsChange]);

  if (!items.length) return null;

  return (
    <div className="ais-slash-menu ais-mention-menu" role="listbox">
      {items.map((target, index) => {
        const isSelected = index === activeIndex;

        return (
          <button
            aria-selected={isSelected}
            key={target.id}
            className={`ais-slash-item ${isSelected ? "is-selected" : ""}`}
            onClick={() => {
              onSelect(target);
              onClose();
            }}
            onMouseEnter={() => onActiveIndexChange(index)}
            role="option"
            type="button"
          >
            <span className="ais-slash-item-name">{target.label}</span>
            <span className="ais-slash-item-desc">{target.type}</span>
          </button>
        );
      })}
    </div>
  );
}
