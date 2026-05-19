"use client";

import React, { useEffect, useMemo } from "react";
import { getSlashCommandRegistry } from "../../extensions/slash-command-registry";

interface SlashCommandMenuProps {
  query: string;
  activeIndex: number;
  onSelect: (value: string) => void;
  onActiveIndexChange: (index: number) => void;
  onItemsChange: (items: string[]) => void;
  onClose: () => void;
}

export function SlashCommandMenu({
  query,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  onItemsChange,
  onClose,
}: SlashCommandMenuProps) {
  const commands = getSlashCommandRegistry();

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((command) => command.name.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    onItemsChange(filtered.map((command) => command.name));
  }, [filtered, onItemsChange]);

  if (!filtered.length) return null;

  return (
    <div className="ais-slash-menu" role="listbox">
      {filtered.map((command, index) => {
        const isSelected = index === activeIndex;

        return (
          <button
            aria-selected={isSelected}
            key={command.name}
            className={`ais-slash-item ${isSelected ? "is-selected" : ""}`}
            onClick={() => {
              onSelect(command.name);
              onClose();
            }}
            onMouseEnter={() => onActiveIndexChange(index)}
            role="option"
            type="button"
          >
            <span className="ais-slash-item-name">{command.name}</span>
            <span className="ais-slash-item-desc">{command.description}</span>
          </button>
        );
      })}
    </div>
  );
}
