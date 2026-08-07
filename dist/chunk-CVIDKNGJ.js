import { useChatContext, useConversationHistory, useChat, getSlashCommandRegistry, extractSuggestionsFromContent, extractArtifactsFromContent, useStickyBottom, useArtifacts, useSources, useSessionFiles, ChatStateProvider, useViewportHeightFallback } from './chunk-2PWI6ZBA.js';
import { defaultStrings } from './chunk-HMCMFJ5F.js';
import React16, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FileText, X, AlignLeft, Check, Copy, FileDown, Share2, Search, Command, CornerDownLeft, MessageSquare, Plus, SlidersHorizontal, RotateCcw, Square, Mic, CheckCircle2, ExternalLink, Database, CornerDownRight, ChevronDown, MessageCircle, PanelLeftOpen, PanelLeftClose, Sparkles, Paperclip, MoreVertical, MoreHorizontal, ChevronRight, ChevronLeft, Code2, Image, FileSpreadsheet, File, Globe, Trash2, Download, Menu, Info, GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as ResizablePrimitive from 'react-resizable-panels';
import * as Popover from '@radix-ui/react-popover';

// src/extensions/artifact-registry.ts
var registry = /* @__PURE__ */ new Map();
function registerArtifact(type, config) {
  registry.set(type, config);
}
function getArtifactRegistry() {
  return registry;
}
function ArtifactPreview({ artifact, onSendMessage, isStreaming }) {
  const effectiveType = artifact.previewType ?? artifact.type;
  const effectiveContent = artifact.previewContent ?? artifact.content;
  const registry3 = getArtifactRegistry();
  const customRenderer = registry3.get(effectiveType);
  if (customRenderer && customRenderer.detect(effectiveContent)) {
    return /* @__PURE__ */ jsx(Fragment, { children: customRenderer.render(effectiveContent, {
      artifactId: artifact.artifactId,
      type: effectiveType,
      sendMessage: onSendMessage ?? (() => {
      }),
      isStreaming: isStreaming ?? false
    }) });
  }
  if (effectiveType === "table") {
    return /* @__PURE__ */ jsx(TableRenderer, { content: effectiveContent });
  }
  if (effectiveType === "html") {
    return /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: effectiveContent } });
  }
  if (effectiveType === "code") {
    return /* @__PURE__ */ jsx("pre", { children: effectiveContent });
  }
  return /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: effectiveContent });
}
function TableRenderer({ content }) {
  const lines = content.trim().split("\n").filter(Boolean).map(
    (line) => line.split("|").map((cell) => cell.trim()).filter(Boolean)
  );
  if (lines.length < 2) return /* @__PURE__ */ jsx("pre", { children: content });
  const [header, , ...rows] = lines;
  return /* @__PURE__ */ jsxs("table", { className: "ais-table-preview", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: header?.map((cell) => /* @__PURE__ */ jsx("th", { children: cell }, cell)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row, idx) => /* @__PURE__ */ jsx("tr", { children: row.map((cell, cellIdx) => /* @__PURE__ */ jsx("td", { children: cell }, `${idx}-${cellIdx}`)) }, idx)) })
  ] });
}
var TYPE_META = {
  markdown: { label: "Markdown", color: "#2563EB" },
  html: { label: "HTML", color: "#0891B2" },
  code: { label: "Code", color: "#7C3AED" },
  table: { label: "Data Table", color: "#059669" },
  docx: { label: "Word Document", color: "#1D6F42" }
};
var TAB_ICON = {
  preview: /* @__PURE__ */ jsx(AlignLeft, { size: 13 }),
  source: /* @__PURE__ */ jsx(Code2, { size: 13 }),
  export: /* @__PURE__ */ jsx(FileDown, { size: 13 })
};
var TABS_BY_TYPE = {
  markdown: [
    { value: "preview", label: "Preview", icon: /* @__PURE__ */ jsx(AlignLeft, { size: 13 }) },
    { value: "source", label: "Markdown", icon: /* @__PURE__ */ jsx(Code2, { size: 13 }) },
    { value: "export", label: "Export", icon: /* @__PURE__ */ jsx(FileDown, { size: 13 }) }
  ],
  html: [
    { value: "preview", label: "Preview", icon: /* @__PURE__ */ jsx(AlignLeft, { size: 13 }) },
    { value: "source", label: "HTML", icon: /* @__PURE__ */ jsx(Code2, { size: 13 }) },
    { value: "export", label: "Export", icon: /* @__PURE__ */ jsx(FileDown, { size: 13 }) }
  ],
  code: [
    { value: "preview", label: "Code", icon: /* @__PURE__ */ jsx(Code2, { size: 13 }) },
    { value: "export", label: "Export", icon: /* @__PURE__ */ jsx(FileDown, { size: 13 }) }
  ],
  table: [
    { value: "preview", label: "Preview", icon: /* @__PURE__ */ jsx(AlignLeft, { size: 13 }) },
    { value: "export", label: "Export", icon: /* @__PURE__ */ jsx(FileDown, { size: 13 }) }
  ],
  docx: [
    { value: "preview", label: "Preview", icon: /* @__PURE__ */ jsx(AlignLeft, { size: 13 }) },
    { value: "export", label: "Export", icon: /* @__PURE__ */ jsx(FileDown, { size: 13 }) }
  ]
};
function ArtifactPanel({
  artifactsCtx,
  onExportArtifact,
  onSendMessage,
  isStreaming,
  className
}) {
  const { strings } = useChatContext();
  const { artifacts, activeArtifact, panelState, closePanel, setActiveTab } = artifactsCtx;
  const [copied, setCopied] = useState(false);
  const handleCopySource = useCallback(() => {
    if (!activeArtifact) return;
    void navigator.clipboard.writeText(activeArtifact.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [activeArtifact]);
  const handleDownloadMarkdown = useCallback(() => {
    if (!activeArtifact) return;
    try {
      const blob = new Blob([activeArtifact.content], {
        type: "text/markdown"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeArtifact.title}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Markdown export failed:", err);
    }
  }, [activeArtifact]);
  if (!panelState.isOpen) return null;
  if (!activeArtifact) {
    const hasAnyArtifacts = artifacts.size > 0;
    return /* @__PURE__ */ jsxs("aside", { className: `ais-artifact-panel ais-animate-artifact-panel-in ${className ?? ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "ais-ap-accent-bar" }),
      /* @__PURE__ */ jsxs("header", { className: "ais-ap-header", children: [
        /* @__PURE__ */ jsx("div", { className: "ais-ap-header-icon", children: /* @__PURE__ */ jsx(FileText, { size: 15 }) }),
        /* @__PURE__ */ jsxs("div", { className: "ais-ap-header-body", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-ap-meta-row", children: /* @__PURE__ */ jsx("span", { className: "ais-ap-type-badge", children: "Artifacts" }) }),
          /* @__PURE__ */ jsx("h3", { className: "ais-ap-title", children: "No artifact selected" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": strings.artifactPanelClose || "Close",
            className: "ais-ap-close",
            onClick: closePanel,
            type: "button",
            children: /* @__PURE__ */ jsx(X, { size: 15 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ais-ap-empty", children: /* @__PURE__ */ jsxs("div", { className: "ais-ap-empty-inner", children: [
        /* @__PURE__ */ jsx("p", { className: "ais-ap-empty-title", children: "Artifacts will appear here." }),
        /* @__PURE__ */ jsx("p", { className: "ais-ap-empty-body", children: "When the agent generates documents or structured outputs, you can review and export them from this panel." }),
        hasAnyArtifacts && /* @__PURE__ */ jsx("p", { className: "ais-ap-empty-note", children: "We found generated artifacts in this session. Open an artifact chip in the chat to preview it here." })
      ] }) })
    ] });
  }
  const hasPreview = Boolean(
    activeArtifact.previewContent && activeArtifact.previewContent.trim() || activeArtifact.content && activeArtifact.content.trim()
  );
  const registryConfig = getArtifactRegistry().get(activeArtifact.type);
  const tabs = registryConfig?.tabs ? registryConfig.tabs.map((tab) => ({
    value: tab.value,
    label: tab.label,
    icon: TAB_ICON[tab.value] ?? /* @__PURE__ */ jsx(AlignLeft, { size: 13 })
  })) : (() => {
    const tabsByType = TABS_BY_TYPE[activeArtifact.type] ?? TABS_BY_TYPE.markdown;
    return activeArtifact.type === "docx" && !hasPreview ? tabsByType.filter((tab) => tab.value !== "preview") : tabsByType;
  })();
  const meta = {
    label: registryConfig?.label ?? TYPE_META[activeArtifact.type]?.label ?? activeArtifact.type.toUpperCase(),
    color: registryConfig?.color ?? TYPE_META[activeArtifact.type]?.color ?? "#64748B"
  };
  const previewText = activeArtifact.previewContent ?? activeArtifact.content ?? "";
  const wordCount = previewText.replace(/[#*`_\-[\]()]/g, "").split(/\s+/).filter(Boolean).length;
  return /* @__PURE__ */ jsxs("aside", { className: `ais-artifact-panel ais-animate-artifact-panel-in ${className ?? ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: "ais-ap-accent-bar" }),
    /* @__PURE__ */ jsxs("header", { className: "ais-ap-header", children: [
      /* @__PURE__ */ jsx("div", { className: "ais-ap-header-icon", children: /* @__PURE__ */ jsx(FileText, { size: 15 }) }),
      /* @__PURE__ */ jsxs("div", { className: "ais-ap-header-body", children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-ap-meta-row", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "ais-ap-type-badge",
              style: { "--ap-type-color": meta.color },
              children: meta.label
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "ais-ap-word-count", children: [
            wordCount.toLocaleString(),
            " words"
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "ais-ap-title", children: activeArtifact.title })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          "aria-label": "Close artifact panel",
          className: "ais-ap-close",
          onClick: closePanel,
          type: "button",
          children: /* @__PURE__ */ jsx(X, { size: 15 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      Tabs.Root,
      {
        className: "ais-ap-tabs-root",
        onValueChange: (v) => setActiveTab(v),
        value: panelState.activeTab,
        children: [
          /* @__PURE__ */ jsx(Tabs.List, { className: "ais-ap-tab-list", children: tabs.map((tab) => /* @__PURE__ */ jsxs(Tabs.Trigger, { className: "ais-ap-tab", value: tab.value, children: [
            tab.icon,
            tab.label
          ] }, tab.value)) }),
          /* @__PURE__ */ jsx(Tabs.Content, { className: "ais-ap-tab-content ais-ap-preview", value: "preview", children: /* @__PURE__ */ jsx("div", { className: "ais-ap-prose", children: /* @__PURE__ */ jsx(
            ArtifactPreview,
            {
              artifact: activeArtifact,
              onSendMessage,
              isStreaming
            }
          ) }) }),
          /* @__PURE__ */ jsxs(Tabs.Content, { className: "ais-ap-tab-content ais-ap-source", value: "source", children: [
            /* @__PURE__ */ jsxs("div", { className: "ais-ap-source-toolbar", children: [
              /* @__PURE__ */ jsx("span", { className: "ais-ap-source-lang", children: meta.label }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `ais-ap-copy-btn ${copied ? "is-copied" : ""}`,
                  onClick: handleCopySource,
                  type: "button",
                  children: [
                    copied ? /* @__PURE__ */ jsx(Check, { size: 13 }) : /* @__PURE__ */ jsx(Copy, { size: 13 }),
                    copied ? "Copied!" : "Copy"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "ais-ap-source-pre", children: activeArtifact.content })
          ] }),
          /* @__PURE__ */ jsx(Tabs.Content, { className: "ais-ap-tab-content ais-ap-export", value: "export", children: /* @__PURE__ */ jsxs("div", { className: "ais-ap-export-body", children: [
            /* @__PURE__ */ jsx("div", { className: "ais-ap-export-section-label", children: "Download" }),
            /* @__PURE__ */ jsxs("div", { className: "ais-ap-export-options", children: [
              activeArtifact.downloadUrl && /* @__PURE__ */ jsxs(
                "a",
                {
                  className: "ais-ap-export-btn ais-ap-export-btn--docx",
                  href: activeArtifact.downloadUrl,
                  download: `${activeArtifact.title}.docx`,
                  rel: "noopener noreferrer",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-icon", children: /* @__PURE__ */ jsx(FileDown, { size: 18 }) }),
                    /* @__PURE__ */ jsxs("span", { className: "ais-ap-export-btn-label", children: [
                      /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-title", children: "Word document" }),
                      /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-sub", children: "Formatted DOCX, ready for sharing" })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "ais-ap-export-ext", children: ".docx" })
                  ]
                }
              ),
              activeArtifact.exportFormats.includes("markdown") && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "ais-ap-export-btn ais-ap-export-btn--md",
                  onClick: handleDownloadMarkdown,
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-icon", children: /* @__PURE__ */ jsx(FileDown, { size: 18 }) }),
                    /* @__PURE__ */ jsxs("span", { className: "ais-ap-export-btn-label", children: [
                      /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-title", children: "Markdown file" }),
                      /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-sub", children: "Plain text, universally compatible" })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "ais-ap-export-ext", children: ".md" })
                  ]
                }
              ),
              onExportArtifact && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "ais-ap-export-btn ais-ap-export-btn--save",
                  onClick: () => void onExportArtifact(activeArtifact.artifactId),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-icon", children: /* @__PURE__ */ jsx(Share2, { size: 18 }) }),
                    /* @__PURE__ */ jsxs("span", { className: "ais-ap-export-btn-label", children: [
                      /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-title", children: strings.exportArtifact }),
                      strings.exportArtifactSub && /* @__PURE__ */ jsx("span", { className: "ais-ap-export-btn-sub", children: strings.exportArtifactSub })
                    ] })
                  ]
                }
              )
            ] })
          ] }) })
        ]
      }
    )
  ] });
}
function ArtifactTabs({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "ais-artifact-tabs", children });
}

// src/extensions/command-registry.ts
var registry2 = [];
function registerCommand(cmd) {
  const existing = registry2.findIndex((c) => c.id === cmd.id);
  if (existing >= 0) {
    registry2[existing] = cmd;
  } else {
    registry2.push(cmd);
  }
}
function unregisterCommand(id) {
  const idx = registry2.findIndex((c) => c.id === id);
  if (idx >= 0) registry2.splice(idx, 1);
}
function getCommandRegistry() {
  return registry2;
}
function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [portalContainer, setPortalContainer] = useState(null);
  const commands = getCommandRegistry();
  const { sessions, isLoading } = useConversationHistory();
  const { loadSession } = useChat();
  const { adapter, config } = useChatContext();
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    if (!config?.enableCommandPalette) return;
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    const handleOpen = () => {
      setOpen(true);
      setSelectedIndex(0);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("ais-open-command-palette", handleOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("ais-open-command-palette", handleOpen);
    };
  }, [config?.enableCommandPalette]);
  const q = query.toLowerCase().trim();
  const filtered = useMemo(() => {
    const filteredCommands = q ? commands.filter((cmd) => `${cmd.label} ${cmd.description ?? ""}`.toLowerCase().includes(q)) : commands;
    const filteredSessions = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions.slice(0, 5);
    return [
      ...filteredCommands.map((cmd) => ({
        type: "command",
        id: `cmd-${cmd.id}`,
        label: cmd.label,
        description: cmd.description,
        action: () => cmd.onExecute()
      })),
      ...filteredSessions.map((s) => ({
        type: "session",
        id: `session-${s.sessionId}`,
        label: s.title,
        description: "Recent chat",
        action: async () => {
          const full = await adapter.loadSession(s.sessionId);
          loadSession(full);
        }
      }))
    ];
  }, [commands, sessions, q, adapter, loadSession]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = async (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (event.key === "Enter" && filtered[selectedIndex]) {
        event.preventDefault();
        await filtered[selectedIndex].action();
        setOpen(false);
        setQuery("");
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, selectedIndex]);
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);
  useEffect(() => {
    const host = document.querySelector('[data-chat-provider="ai-chat-sdk"]');
    setPortalContainer(host);
  }, []);
  useEffect(() => {
    if (!open) return;
    const selectedElement = document.getElementById(`ais-command-item-${selectedIndex}`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);
  const commandItems = filtered.filter((i) => i.type === "command");
  const sessionItems = filtered.filter((i) => i.type === "session");
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { onOpenChange: setOpen, open, children: /* @__PURE__ */ jsxs(DialogPrimitive.Portal, { container: portalContainer ?? void 0, children: [
    /* @__PURE__ */ jsx(DialogPrimitive.Overlay, { className: "ais-dialog-overlay" }),
    /* @__PURE__ */ jsxs(DialogPrimitive.Content, { className: "ais-command-palette", children: [
      /* @__PURE__ */ jsx(DialogPrimitive.Title, { className: "ais-sr-only", children: "Command Palette" }),
      /* @__PURE__ */ jsx(DialogPrimitive.Description, { className: "ais-sr-only", children: "Search for commands and recent chat conversations." }),
      /* @__PURE__ */ jsxs("div", { className: "ais-command-header", children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-command-header-brand", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("span", { className: "ais-command-header-dot" }),
          /* @__PURE__ */ jsx("span", { children: "Command Center" })
        ] }),
        /* @__PURE__ */ jsx(Search, { className: "ais-command-search-icon", size: 20 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            "aria-activedescendant": filtered[selectedIndex] ? `ais-command-item-${selectedIndex}` : void 0,
            "aria-autocomplete": "list",
            "aria-controls": "ais-command-listbox",
            "aria-expanded": open,
            "aria-label": "Search commands and chats",
            autoComplete: "off",
            autoFocus: true,
            className: "ais-command-input",
            onChange: (event) => setQuery(event.target.value),
            placeholder: "Search commands and chats...",
            role: "combobox",
            value: query
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Close command palette",
            className: "ais-command-close",
            onClick: () => setOpen(false),
            type: "button",
            children: /* @__PURE__ */ jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ais-command-body", id: "ais-command-listbox", role: "listbox", children: isLoading && filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "ais-command-empty", children: /* @__PURE__ */ jsx("p", { className: "ais-command-item-description", children: "Loading\u2026" }) }) : filtered.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        commandItems.length > 0 && /* @__PURE__ */ jsxs("div", { className: "ais-command-section", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-command-section-title", children: "Commands" }),
          /* @__PURE__ */ jsx("ul", { className: "ais-command-list", children: commandItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return /* @__PURE__ */ jsx("li", { className: "ais-command-item", children: /* @__PURE__ */ jsxs(
              "button",
              {
                "aria-selected": isSelected,
                className: `ais-command-item-button ${isSelected ? "is-selected" : ""}`,
                id: `ais-command-item-${idx}`,
                onClick: async () => {
                  await item.action();
                  setOpen(false);
                  setQuery("");
                },
                onMouseEnter: () => setSelectedIndex(idx),
                role: "option",
                type: "button",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "ais-command-item-icon", children: /* @__PURE__ */ jsx(Command, { size: 18 }) }),
                  /* @__PURE__ */ jsxs("div", { className: "ais-command-item-content", children: [
                    /* @__PURE__ */ jsx("span", { className: "ais-command-item-label", children: item.label }),
                    item.description ? /* @__PURE__ */ jsx("span", { className: "ais-command-item-description", children: item.description }) : null
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "ais-command-item-enter", children: /* @__PURE__ */ jsx(CornerDownLeft, { size: 14 }) })
                ]
              }
            ) }, item.id);
          }) })
        ] }),
        sessionItems.length > 0 && /* @__PURE__ */ jsxs("div", { className: "ais-command-section", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-command-section-title", children: "Recent Conversations" }),
          /* @__PURE__ */ jsx("ul", { className: "ais-command-list", children: sessionItems.map((item, idx) => {
            const flatIdx = commandItems.length + idx;
            const isSelected = flatIdx === selectedIndex;
            return /* @__PURE__ */ jsx("li", { className: "ais-command-item", children: /* @__PURE__ */ jsxs(
              "button",
              {
                "aria-selected": isSelected,
                className: `ais-command-item-button ${isSelected ? "is-selected" : ""}`,
                id: `ais-command-item-${flatIdx}`,
                onClick: async () => {
                  await item.action();
                  setOpen(false);
                  setQuery("");
                },
                onMouseEnter: () => setSelectedIndex(flatIdx),
                role: "option",
                type: "button",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "ais-command-item-icon", children: /* @__PURE__ */ jsx(MessageSquare, { size: 18 }) }),
                  /* @__PURE__ */ jsxs("div", { className: "ais-command-item-content", children: [
                    /* @__PURE__ */ jsx("span", { className: "ais-command-item-label", children: item.label }),
                    item.description ? /* @__PURE__ */ jsx("span", { className: "ais-command-item-description", children: item.description }) : null
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "ais-command-item-enter", children: /* @__PURE__ */ jsx(CornerDownLeft, { size: 14 }) })
                ]
              }
            ) }, item.id);
          }) })
        ] })
      ] }) : q ? /* @__PURE__ */ jsxs("div", { className: "ais-command-empty", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "No results found for \u201C",
          query,
          "\u201D"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "ais-command-item-description", children: "Try a different search term" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "ais-command-empty", children: /* @__PURE__ */ jsx("p", { className: "ais-command-item-description", children: "No recent conversations" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "ais-command-footer", children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-command-shortcut", children: [
          /* @__PURE__ */ jsx("kbd", { children: "Esc" }),
          " ",
          /* @__PURE__ */ jsx("span", { children: "to close" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ais-command-shortcut", children: [
          /* @__PURE__ */ jsx("kbd", { children: "\u21B5" }),
          " ",
          /* @__PURE__ */ jsx("span", { children: "to select" })
        ] })
      ] })
    ] })
  ] }) });
}
function fileIcon(mimeType, size = 14) {
  if (mimeType.startsWith("image/")) return /* @__PURE__ */ jsx(Image, { size });
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return /* @__PURE__ */ jsx(FileSpreadsheet, { size });
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document"))
    return /* @__PURE__ */ jsx(FileText, { size });
  return /* @__PURE__ */ jsx(File, { size });
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function truncateName(name, max = 28) {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf(".");
  if (ext > 0) {
    const extStr = name.slice(ext);
    return `${name.slice(0, max - extStr.length - 1)}\u2026${extStr}`;
  }
  return `${name.slice(0, max - 1)}\u2026`;
}
function AttachmentChipBar({ files, onRemove }) {
  if (!files.length) return null;
  return /* @__PURE__ */ jsx("div", { className: "ais-attachment-chip-bar", role: "list", "aria-label": "Attached files", children: files.map((f) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: `ais-attachment-chip${f.status === "uploading" ? " ais-attachment-chip--uploading" : ""}`,
      role: "listitem",
      children: [
        /* @__PURE__ */ jsx("span", { className: "ais-attachment-chip-icon", "aria-hidden": "true", children: f.status === "uploading" ? /* @__PURE__ */ jsx("span", { className: "ais-attachment-chip-spinner" }) : fileIcon(f.mimeType, 13) }),
        /* @__PURE__ */ jsx("span", { className: "ais-attachment-chip-name", title: f.fileName, children: truncateName(f.fileName) }),
        /* @__PURE__ */ jsx("span", { className: "ais-attachment-chip-size", children: formatBytes(f.size) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ais-attachment-chip-remove",
            onClick: () => onRemove(f.id),
            type: "button",
            "aria-label": `Remove ${f.fileName}`,
            disabled: f.status === "uploading",
            children: /* @__PURE__ */ jsx(X, { size: 11 })
          }
        )
      ]
    },
    f.id
  )) });
}
function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
function ComposerBanner({ banner, onDismiss, position, className }) {
  const resolvedPosition = position ?? banner.position ?? "bottom";
  const handleDismiss = () => {
    banner.onDismiss?.();
    onDismiss?.();
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "ais-composer-banner",
        `ais-composer-banner--${banner.type}`,
        `ais-composer-banner--${resolvedPosition}`,
        className
      ),
      role: "status",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ jsxs("span", { className: "ais-composer-banner__title-wrap", children: [
          banner.icon ? /* @__PURE__ */ jsx("span", { className: "ais-composer-banner__icon", "aria-hidden": "true", children: banner.icon }) : null,
          /* @__PURE__ */ jsx("span", { className: "ais-composer-banner__title", children: banner.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ais-composer-banner__actions", children: [
          banner.action ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ais-composer-banner__action-btn",
              onClick: banner.action.onClick,
              children: banner.action.label
            }
          ) : null,
          banner.dismissible !== false ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ais-composer-banner__dismiss",
              onClick: handleDismiss,
              "aria-label": "Dismiss banner",
              children: "\xD7"
            }
          ) : null
        ] })
      ]
    }
  );
}
function SlashCommandMenu({
  query,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  onItemsChange,
  onClose
}) {
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
  return /* @__PURE__ */ jsx("div", { className: "ais-slash-menu", role: "listbox", children: filtered.map((command, index) => {
    const isSelected = index === activeIndex;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        "aria-selected": isSelected,
        className: `ais-slash-item ${isSelected ? "is-selected" : ""}`,
        onClick: () => {
          onSelect(command.name);
          onClose();
        },
        onMouseEnter: () => onActiveIndexChange(index),
        role: "option",
        type: "button",
        children: [
          /* @__PURE__ */ jsx("span", { className: "ais-slash-item-name", children: command.name }),
          /* @__PURE__ */ jsx("span", { className: "ais-slash-item-desc", children: command.description })
        ]
      },
      command.name
    );
  }) });
}
function MentionMenu({
  query,
  activeIndex,
  provider,
  onSelect,
  onActiveIndexChange,
  onItemsChange,
  onClose
}) {
  const [items, setItems] = useState([]);
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
  return /* @__PURE__ */ jsx("div", { className: "ais-slash-menu ais-mention-menu", role: "listbox", children: items.map((target, index) => {
    const isSelected = index === activeIndex;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        "aria-selected": isSelected,
        className: `ais-slash-item ${isSelected ? "is-selected" : ""}`,
        onClick: () => {
          onSelect(target);
          onClose();
        },
        onMouseEnter: () => onActiveIndexChange(index),
        role: "option",
        type: "button",
        children: [
          /* @__PURE__ */ jsx("span", { className: "ais-slash-item-name", children: target.label }),
          /* @__PURE__ */ jsx("span", { className: "ais-slash-item-desc", children: target.type })
        ]
      },
      target.id
    );
  }) });
}
function ComposerPlusMenu({ onClose, onUploadFiles }) {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);
  return /* @__PURE__ */ jsx("div", { className: "ais-composer-plus-menu", ref: menuRef, role: "menu", children: /* @__PURE__ */ jsxs(
    "button",
    {
      className: "ais-composer-plus-menu-item",
      onClick: () => {
        onUploadFiles();
        onClose();
      },
      role: "menuitem",
      type: "button",
      children: [
        /* @__PURE__ */ jsx(Paperclip, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Upload files or photos" })
      ]
    }
  ) });
}
function ComposerToolsMenu({ onClose }) {
  const menuRef = useRef(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);
  return /* @__PURE__ */ jsx("div", { className: "ais-composer-plus-menu ais-composer-tools-menu", ref: menuRef, role: "menu", children: /* @__PURE__ */ jsxs(
    "button",
    {
      "aria-checked": webSearchEnabled,
      "aria-label": "Web search \u2014 coming soon",
      className: `ais-composer-plus-menu-item ais-composer-tools-menu-item${webSearchEnabled ? " is-active" : ""} ais-composer-plus-menu-item--soon`,
      disabled: true,
      role: "menuitemcheckbox",
      title: "Web search \u2014 coming soon",
      type: "button",
      children: [
        /* @__PURE__ */ jsx(Globe, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Web search" }),
        /* @__PURE__ */ jsxs("span", { className: "ais-composer-tools-menu-end", children: [
          webSearchEnabled ? /* @__PURE__ */ jsx(Check, { size: 14, strokeWidth: 2.5 }) : null,
          /* @__PURE__ */ jsx("span", { className: "ais-composer-plus-menu-badge", children: "soon" })
        ] })
      ]
    }
  ) });
}
function ContextTagBar({ tags = [], onRemove, className }) {
  if (!tags.length) return null;
  return /* @__PURE__ */ jsx("div", { className: cn("ais-context-tag-bar", className), children: tags.map((tag, i) => /* @__PURE__ */ jsxs("span", { className: "ais-context-tag", children: [
    tag,
    onRemove && /* @__PURE__ */ jsx(
      "button",
      {
        className: "ais-context-tag-remove",
        onClick: () => onRemove(i),
        type: "button",
        "aria-label": `Remove ${tag}`,
        children: /* @__PURE__ */ jsx(X, { size: 12 })
      }
    )
  ] }, `${tag}-${i}`)) });
}
function ChatComposer({
  onSendMessage,
  isStreaming,
  onStop,
  resumeState,
  onResume,
  className
}) {
  const {
    adapter,
    config,
    strings,
    plugins,
    currentSession,
    setCurrentSession,
    organizationId,
    activeContextId,
    activeContextLabel,
    setActiveContext,
    topBanner,
    setTopBanner,
    bottomBanner,
    setBottomBanner,
    contextReferences,
    addContextReference,
    removeContextReference
  } = useChatContext();
  const { enableFileUpload, enableResumeRetry } = config;
  const showResumeControl = enableResumeRetry && !isStreaming && typeof onResume === "function" && (resumeState === "resumable" || resumeState === "retry");
  const resumeLabel = resumeState === "resumable" ? "Resume" : "Retry";
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [activeSlashIndex, setActiveSlashIndex] = useState(0);
  const [slashMenuItems, setSlashMenuItems] = useState([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const [mentionMenuItems, setMentionMenuItems] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleFilesSelected = async (e) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length || !adapter.uploadFile) return;
    e.target.value = "";
    let sessionId = currentSession?.sessionId;
    if (!sessionId) {
      sessionId = await adapter.createSession({
        organizationId,
        contextId: activeContextId
      });
      setCurrentSession({
        sessionId,
        title: "New conversation",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active",
        contextId: activeContextId
      });
    }
    const resolvedSessionId = sessionId;
    const now = Date.now();
    const placeholders = selectedFiles.map((file, i) => ({
      id: `uploading-${now}-${i}-${file.name}`,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      status: "uploading",
      downloadUrl: ""
    }));
    setPendingFiles((prev) => [...prev, ...placeholders]);
    await Promise.allSettled(
      selectedFiles.map(async (file, i) => {
        const tempId = placeholders[i].id;
        try {
          const uploaded = await adapter.uploadFile(resolvedSessionId, file);
          setPendingFiles((prev) => prev.map((f) => f.id === tempId ? uploaded : f));
        } catch {
          setPendingFiles((prev) => prev.filter((f) => f.id !== tempId));
        }
      })
    );
  };
  const handleRemovePendingFile = async (fileId) => {
    const file = pendingFiles.find((f) => f.id === fileId);
    if (!file || !currentSession?.sessionId) return;
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (file.status !== "uploading" && adapter.deleteSessionFile) {
      await adapter.deleteSessionFile(currentSession.sessionId, fileId).catch(() => {
      });
    }
  };
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const targetHeight = value ? Math.min(textarea.scrollHeight, 120) : 40;
    textarea.style.height = `${targetHeight}px`;
  }, [value]);
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!config?.enableSlashFocusShortcut) return;
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.getAttribute("contenteditable") === "true")) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [config?.enableSlashFocusShortcut]);
  useEffect(() => {
    if (!showSlashMenu) {
      setActiveSlashIndex(0);
      if (slashMenuItems.length > 0) {
        setSlashMenuItems([]);
      }
      return;
    }
    setActiveSlashIndex((currentIndex) => {
      if (!slashMenuItems.length) {
        return 0;
      }
      return Math.min(currentIndex, slashMenuItems.length - 1);
    });
  }, [showSlashMenu, slashMenuItems]);
  useEffect(() => {
    if (!showMentionMenu) {
      setActiveMentionIndex(0);
      if (mentionMenuItems.length > 0) {
        setMentionMenuItems([]);
      }
      return;
    }
    setActiveMentionIndex((currentIndex) => {
      if (mentionMenuItems.length === 0) return 0;
      return currentIndex >= mentionMenuItems.length ? mentionMenuItems.length - 1 : currentIndex;
    });
  }, [showMentionMenu, mentionMenuItems]);
  const submit = (overrideValue) => {
    const message = (overrideValue ?? value).trim();
    if (!message || isStreaming) return;
    const fileIds = pendingFiles.filter((f) => f.status !== "uploading").map((f) => f.id);
    onSendMessage(message, fileIds.length > 0 ? fileIds : void 0);
    setValue("");
    setShowSlashMenu(false);
    setShowMentionMenu(false);
    setPendingFiles([]);
  };
  const selectSlashCommand = (commandName, preventSubmit = false) => {
    const command = getSlashCommandRegistry().find((c) => c.name === commandName);
    if (command) {
      command.onSelect({
        setValue,
        submit: (v) => {
          if (preventSubmit) {
            setValue(v ?? commandName);
          } else {
            submit(v ?? commandName);
          }
        }
      });
    } else {
      setValue(commandName);
    }
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };
  const selectMentionTarget = (target) => {
    addContextReference({
      id: target.id,
      label: target.label,
      kind: "mention",
      value: target.value || target.id,
      removable: true
    });
    const lastAtIdx = value.lastIndexOf("@");
    if (lastAtIdx >= 0) {
      setValue(value.slice(0, lastAtIdx) + `@${target.label} `);
    } else {
      setValue(value + `@${target.label} `);
    }
    setShowMentionMenu(false);
    textareaRef.current?.focus();
  };
  const contextTags = [
    ...activeContextLabel || activeContextId ? [{ id: "active-context", label: activeContextLabel ?? activeContextId }] : [],
    ...contextReferences
  ];
  return /* @__PURE__ */ jsxs("div", { className: cn("ais-composer", className), children: [
    contextTags.length > 0 && /* @__PURE__ */ jsx(
      ContextTagBar,
      {
        tags: contextTags.map((t) => t.label),
        onRemove: (idx) => {
          const t = contextTags[idx];
          if (t && t.id === "active-context") {
            setActiveContext(void 0);
          } else if (t) {
            removeContextReference(t.id);
          }
        }
      }
    ),
    topBanner && /* @__PURE__ */ jsx(ComposerBanner, { banner: topBanner, position: "top", onDismiss: () => setTopBanner(null) }),
    /* @__PURE__ */ jsxs("div", { className: "ais-composer-container", children: [
      enableFileUpload && pendingFiles.length > 0 && /* @__PURE__ */ jsx(AttachmentChipBar, { files: pendingFiles, onRemove: handleRemovePendingFile }),
      showSlashMenu ? /* @__PURE__ */ jsx(
        SlashCommandMenu,
        {
          activeIndex: activeSlashIndex,
          onActiveIndexChange: setActiveSlashIndex,
          onClose: () => setShowSlashMenu(false),
          onItemsChange: setSlashMenuItems,
          onSelect: (cmd) => selectSlashCommand(cmd, true),
          query: value.slice(1)
        }
      ) : null,
      showMentionMenu && plugins.mentionProvider ? /* @__PURE__ */ jsx(
        MentionMenu,
        {
          activeIndex: activeMentionIndex,
          onActiveIndexChange: setActiveMentionIndex,
          onClose: () => setShowMentionMenu(false),
          onItemsChange: setMentionMenuItems,
          onSelect: (target) => selectMentionTarget(target),
          query: value.split(/\s+/).pop()?.slice(1) || "",
          provider: plugins.mentionProvider
        }
      ) : null,
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref: textareaRef,
          className: "ais-composer-input",
          onChange: (event) => {
            const next = event.target.value;
            setValue(next);
            setActiveSlashIndex(0);
            setActiveMentionIndex(0);
            setShowSlashMenu(config.enableSlashCommands && next.startsWith("/"));
            if (plugins.mentionProvider) {
              const lastWord = next.split(/\s+/).pop();
              setShowMentionMenu(!!lastWord && lastWord.startsWith("@"));
            }
          },
          onCompositionEnd: () => setIsComposing(false),
          onCompositionStart: () => setIsComposing(true),
          onKeyDown: (event) => {
            if (showSlashMenu && event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setShowSlashMenu(false);
              return;
            }
            if (showMentionMenu && event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setShowMentionMenu(false);
              return;
            }
            if (showSlashMenu && slashMenuItems.length > 0) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveSlashIndex((currentIndex) => (currentIndex + 1) % slashMenuItems.length);
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveSlashIndex(
                  (currentIndex) => (currentIndex - 1 + slashMenuItems.length) % slashMenuItems.length
                );
                return;
              }
              if (event.key === "Tab") {
                event.preventDefault();
                const selectedCommand = slashMenuItems[activeSlashIndex];
                if (selectedCommand) {
                  selectSlashCommand(selectedCommand, true);
                }
                return;
              }
              if (event.key === "Enter" && !event.shiftKey && !isComposing) {
                event.preventDefault();
                const selectedCommand = slashMenuItems[activeSlashIndex];
                if (selectedCommand) {
                  selectSlashCommand(selectedCommand);
                }
                return;
              }
            } else if (showMentionMenu && mentionMenuItems.length > 0) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveMentionIndex(
                  (currentIndex) => (currentIndex + 1) % mentionMenuItems.length
                );
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveMentionIndex(
                  (currentIndex) => (currentIndex - 1 + mentionMenuItems.length) % mentionMenuItems.length
                );
                return;
              }
              if (event.key === "Tab" || event.key === "Enter" && !event.shiftKey && !isComposing) {
                event.preventDefault();
                const selectedTarget = mentionMenuItems[activeMentionIndex];
                if (selectedTarget) {
                  selectMentionTarget(selectedTarget);
                }
                return;
              }
            }
            if (event.key === "Enter" && !event.shiftKey && !isComposing) {
              event.preventDefault();
              submit();
            }
          },
          placeholder: strings.composerPlaceholder,
          rows: 1,
          value
        }
      ),
      enableFileUpload && showPlusMenu ? /* @__PURE__ */ jsx(
        ComposerPlusMenu,
        {
          onClose: () => setShowPlusMenu(false),
          onUploadFiles: () => fileInputRef.current?.click()
        }
      ) : null,
      showToolsMenu ? /* @__PURE__ */ jsx(ComposerToolsMenu, { onClose: () => setShowToolsMenu(false) }) : null,
      enableFileUpload && /* @__PURE__ */ jsx(
        "input",
        {
          accept: "image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md",
          multiple: true,
          onChange: handleFilesSelected,
          ref: fileInputRef,
          style: { display: "none" },
          type: "file"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "ais-composer-footer", children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-composer-footer-left", children: [
          enableFileUpload && /* @__PURE__ */ jsx(
            "button",
            {
              "aria-expanded": showPlusMenu,
              "aria-haspopup": "menu",
              "aria-label": "Add attachment",
              className: "ais-composer-footer-btn ais-composer-footer-btn--circle",
              onClick: () => {
                setShowToolsMenu(false);
                setShowPlusMenu((v) => !v);
              },
              type: "button",
              children: /* @__PURE__ */ jsx(Plus, { size: 16 })
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              "aria-expanded": showToolsMenu,
              "aria-haspopup": "menu",
              "aria-label": "Tools",
              className: "ais-composer-footer-btn",
              onClick: () => {
                setShowPlusMenu(false);
                setShowToolsMenu((v) => !v);
              },
              type: "button",
              children: [
                /* @__PURE__ */ jsx(SlidersHorizontal, { size: 14 }),
                /* @__PURE__ */ jsx("span", { children: "Tools" })
              ]
            }
          ),
          plugins?.composerActions
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ais-composer-footer-right", children: [
          showResumeControl && /* @__PURE__ */ jsxs(
            "button",
            {
              className: "ais-composer-footer-btn ais-composer-resume-btn",
              type: "button",
              "aria-label": `${resumeLabel} the previous response`,
              title: resumeState === "resumable" ? "Continue the interrupted response" : "Re-send your last message",
              onClick: onResume,
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { size: 14 }),
                /* @__PURE__ */ jsx("span", { children: resumeLabel })
              ]
            }
          ),
          isStreaming && onStop ? /* @__PURE__ */ jsxs(
            "button",
            {
              className: "ais-composer-footer-btn ais-composer-stop-btn",
              type: "button",
              "aria-label": "Stop response",
              title: "Stop response",
              onClick: onStop,
              children: [
                /* @__PURE__ */ jsx(Square, { size: 14, fill: "currentColor" }),
                /* @__PURE__ */ jsx("span", { children: "Stop" })
              ]
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              className: "ais-composer-footer-btn ais-composer-footer-btn--soon",
              type: "button",
              "aria-label": "Voice input \u2014 coming soon",
              title: "Voice input \u2014 coming soon",
              disabled: true,
              children: /* @__PURE__ */ jsx(Mic, { size: 16 })
            }
          )
        ] })
      ] })
    ] }),
    bottomBanner && /* @__PURE__ */ jsx(
      ComposerBanner,
      {
        banner: bottomBanner,
        position: "bottom",
        onDismiss: () => setBottomBanner(null)
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "ais-chat-footer", children: /* @__PURE__ */ jsx("p", { children: strings.footerDisclaimer }) })
  ] });
}
function ChatEmptyState({
  onSendMessage,
  starterCards = [],
  heading = "What would you like to work on today?",
  subheading
}) {
  let enableSlashCommands = true;
  try {
    const { config } = useChatContext();
    enableSlashCommands = config.enableSlashCommands;
  } catch {
  }
  return /* @__PURE__ */ jsx("div", { className: "ais-empty-state", children: /* @__PURE__ */ jsxs("div", { className: "ais-empty-state-inner", children: [
    /* @__PURE__ */ jsxs("div", { className: "ais-empty-prompt-header", children: [
      /* @__PURE__ */ jsx("h2", { className: "ais-empty-heading ais-empty-heading--gradient", children: heading }),
      subheading && /* @__PURE__ */ jsx("p", { className: "ais-empty-subheading", children: subheading })
    ] }),
    starterCards.length > 0 && /* @__PURE__ */ jsx("div", { className: "ais-starter-grid", role: "list", children: starterCards.map((card, i) => /* @__PURE__ */ jsxs(
      "button",
      {
        role: "listitem",
        className: "ais-starter-card",
        style: { animationDelay: `${i * 75}ms` },
        onClick: () => onSendMessage(card.prompt),
        type: "button",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "ais-starter-card-icon",
              style: {
                color: card.iconColor,
                background: `${card.iconColor}18`
              },
              children: card.icon
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "ais-starter-card-body", children: [
            /* @__PURE__ */ jsx("span", { className: "ais-starter-card-title", children: card.title }),
            /* @__PURE__ */ jsx("span", { className: "ais-starter-card-desc", children: card.description })
          ] })
        ]
      },
      card.title
    )) }),
    enableSlashCommands && /* @__PURE__ */ jsxs("p", { className: "ais-empty-hint", children: [
      "Or type ",
      /* @__PURE__ */ jsx("kbd", { children: "/" }),
      " for slash commands"
    ] })
  ] }) });
}
function ArtifactChip({ artifact, isSaved, onClick }) {
  if (!artifact) return null;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: `ais-artifact-chip ${isSaved ? "is-saved" : ""}`,
      onClick,
      type: "button",
      children: [
        /* @__PURE__ */ jsx("span", { className: "ais-artifact-chip-icon", children: isSaved ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }) : /* @__PURE__ */ jsx(FileText, { size: 14 }) }),
        /* @__PURE__ */ jsxs("span", { className: "ais-artifact-chip-body", children: [
          /* @__PURE__ */ jsx("span", { className: "ais-artifact-chip-title", children: artifact.title }),
          /* @__PURE__ */ jsx("span", { className: "ais-artifact-chip-hint", children: isSaved ? "Saved to GRC" : "View document" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "ais-artifact-chip-action", children: /* @__PURE__ */ jsx(ExternalLink, { size: 12 }) })
      ]
    }
  );
}
function formatSubjectLabel(subject) {
  return subject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function RecordChip({ record, onClick }) {
  const label = formatSubjectLabel(record.subject);
  const count = record.ids.length;
  return /* @__PURE__ */ jsxs("button", { className: "ais-record-chip", onClick: () => onClick?.(record), type: "button", children: [
    /* @__PURE__ */ jsx("span", { className: "ais-record-chip-icon", children: /* @__PURE__ */ jsx(Database, { size: 14 }) }),
    /* @__PURE__ */ jsxs("span", { className: "ais-record-chip-body", children: [
      /* @__PURE__ */ jsx("span", { className: "ais-record-chip-title", children: label }),
      /* @__PURE__ */ jsx("span", { className: "ais-record-chip-hint", children: count === 1 ? "View record" : `${count} records` })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "ais-record-chip-action", children: /* @__PURE__ */ jsx(ExternalLink, { size: 12 }) })
  ] });
}
function FollowUpSuggestions({ suggestions, onSelect }) {
  if (!suggestions.length) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "ais-follow-ups-container",
      role: "group",
      "aria-label": "Suggested follow-up questions",
      children: [
        /* @__PURE__ */ jsx("h3", { className: "ais-follow-ups-title", children: "Follow-ups" }),
        /* @__PURE__ */ jsx("div", { className: "ais-follow-ups-list", children: suggestions.map((suggestion) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: "ais-follow-up-item",
            onClick: () => onSelect(suggestion),
            type: "button",
            title: suggestion,
            children: [
              /* @__PURE__ */ jsx(CornerDownRight, { size: 15, className: "ais-follow-up-item-icon", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("span", { className: "ais-follow-up-item-text", children: suggestion })
            ]
          },
          suggestion
        )) })
      ]
    }
  );
}
function ContextRequiredChips({ contextRequired, onSelect }) {
  return /* @__PURE__ */ jsx("div", { className: "ais-context-required-chips", role: "group", "aria-label": "Select an option", children: contextRequired.choices.map((choice) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "ais-context-required-chip",
      onClick: () => onSelect(choice.label),
      children: choice.label
    },
    choice.value
  )) });
}
function humanizeRisk(riskCategory) {
  return riskCategory.replace(/_/g, " ");
}
function formatArgs(args) {
  if (args === void 0 || args === null) return null;
  try {
    return typeof args === "string" ? args : JSON.stringify(args, null, 2);
  } catch {
    return null;
  }
}
function ToolApprovalCard({
  approval,
  canResolve,
  onResolve,
  strings = {}
}) {
  const t = { ...defaultStrings, ...strings };
  const [denying, setDenying] = React16.useState(false);
  const [denyReason, setDenyReason] = React16.useState("");
  const [submitting, setSubmitting] = React16.useState(false);
  const isPending = approval.status === "pending";
  const argsText = formatArgs(approval.args);
  const submit = async (decision, reason) => {
    setSubmitting(true);
    try {
      await onResolve(approval, decision, reason);
    } finally {
      setSubmitting(false);
      setDenying(false);
      setDenyReason("");
    }
  };
  const statusLabel = {
    pending: t.approvalTitle,
    approved: t.approvalApproved,
    denied: t.approvalDenied,
    expired: t.approvalExpired,
    canceled: t.approvalCanceled
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `ais-tool-approval-card ais-tool-approval--${approval.status}`,
      role: "group",
      "aria-label": `${t.approvalTitle}: ${approval.toolName}`,
      "data-testid": `tool-approval-${approval.approvalId}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-tool-approval-header", children: [
          /* @__PURE__ */ jsx("span", { className: "ais-tool-approval-status", children: statusLabel[approval.status] }),
          /* @__PURE__ */ jsx("code", { className: "ais-tool-approval-tool", children: approval.toolName }),
          approval.riskCategory ? /* @__PURE__ */ jsx("span", { className: "ais-tool-approval-risk", children: humanizeRisk(approval.riskCategory) }) : null
        ] }),
        argsText ? /* @__PURE__ */ jsx("pre", { className: "ais-tool-approval-args", children: argsText }) : null,
        !isPending && approval.status === "denied" && approval.reason ? /* @__PURE__ */ jsxs("p", { className: "ais-tool-approval-reason", children: [
          "\u201C",
          approval.reason,
          "\u201D"
        ] }) : null,
        isPending && approval.error ? /* @__PURE__ */ jsx("p", { className: "ais-tool-approval-error", children: approval.error }) : null,
        isPending && !canResolve ? /* @__PURE__ */ jsx("p", { className: "ais-tool-approval-waiting", children: t.approvalWaiting }) : null,
        isPending && canResolve && !denying ? /* @__PURE__ */ jsxs("div", { className: "ais-tool-approval-actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ais-tool-approval-btn ais-tool-approval-btn--approve",
              disabled: submitting,
              onClick: () => void submit("approved"),
              children: t.approvalApprove
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ais-tool-approval-btn ais-tool-approval-btn--deny",
              disabled: submitting,
              onClick: () => setDenying(true),
              children: t.approvalDeny
            }
          )
        ] }) : null,
        isPending && canResolve && denying ? /* @__PURE__ */ jsxs("div", { className: "ais-tool-approval-deny-form", children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "ais-tool-approval-reason-input",
              placeholder: t.approvalDenyReasonPlaceholder,
              value: denyReason,
              rows: 2,
              maxLength: 512,
              disabled: submitting,
              onChange: (e) => setDenyReason(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "ais-tool-approval-actions", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "ais-tool-approval-btn ais-tool-approval-btn--deny",
                disabled: submitting,
                onClick: () => void submit("denied", denyReason.trim() || void 0),
                children: t.approvalConfirmDeny
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "ais-tool-approval-btn",
                disabled: submitting,
                onClick: () => {
                  setDenying(false);
                  setDenyReason("");
                },
                children: t.cancel
              }
            )
          ] })
        ] }) : null
      ]
    }
  );
}
function formatDuration(ms) {
  if (ms < 1e3) return `${ms}ms`;
  return `${(ms / 1e3).toFixed(1)}s`;
}
function ReasoningBlock({ steps, plan, isStreaming, elapsedMs }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState(/* @__PURE__ */ new Set());
  const [expandedSteps, setExpandedSteps] = useState(/* @__PURE__ */ new Set());
  const skillGroups = useMemo(() => {
    const hasHandoff = steps.some((s) => s.type === "handoff");
    if (!hasHandoff) return null;
    const groups = [];
    let current = null;
    for (const step of steps) {
      if (step.type === "handoff") {
        if (current) groups.push(current);
        current = { skill: step, steps: [] };
      } else if (current) {
        current.steps.push(step);
      }
    }
    if (current) groups.push(current);
    return groups;
  }, [steps]);
  const headerLabel = useMemo(() => {
    if (isStreaming) {
      const last = steps[steps.length - 1];
      return `${last?.label || "Thinking"}...`;
    }
    return expanded ? "Hide reasoning" : "Show reasoning";
  }, [isStreaming, steps, expanded]);
  if (!isStreaming && !steps.length && !plan?.length && typeof elapsedMs !== "number") {
    return null;
  }
  const seconds = !isStreaming && typeof elapsedMs === "number" ? Math.max(1, Math.round(elapsedMs / 1e3)) : null;
  const toggleSkill = (id) => setExpandedSkills((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const toggleStep = (id) => setExpandedSteps((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  return /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-block", "aria-live": "polite", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setExpanded((v) => !v),
        className: cn("ais-reasoning-toggle", isStreaming && "ais-reasoning-toggle--active"),
        "aria-expanded": expanded,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-headrow", children: [
            /* @__PURE__ */ jsx(
              SparkleIcon,
              {
                spinning: isStreaming,
                className: isStreaming ? "ais-reasoning-icon" : "ais-reasoning-icon--idle"
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "ais-reasoning-label ais-reasoning-textfade",
                  isStreaming && "ais-reasoning-label--active"
                ),
                children: headerLabel
              },
              headerLabel
            ),
            seconds !== null && /* @__PURE__ */ jsxs("span", { className: "ais-reasoning-seconds", children: [
              seconds,
              "s"
            ] })
          ] }),
          isStreaming && /* @__PURE__ */ jsx("div", { className: "ais-reasoning-sweep", "aria-hidden": true })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsx("div", { className: "ais-reasoning-content", children: /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-body", children: [
      plan?.length ? /* @__PURE__ */ jsx("ol", { className: "ais-reasoning-plan", children: plan.map((phase) => /* @__PURE__ */ jsxs("li", { className: "ais-reasoning-plan-item", children: [
        /* @__PURE__ */ jsx("span", { className: "ais-reasoning-plan-dot", "aria-hidden": true }),
        phase.label
      ] }, phase.id)) }) : null,
      skillGroups ? (
        /* Two-level view: skill groups from triage */
        /* @__PURE__ */ jsxs("ol", { className: "ais-reasoning-groups", children: [
          skillGroups.map((group, groupIdx) => {
            const isLastGroup = groupIdx === skillGroups.length - 1;
            const isSkillOpen = isStreaming && isLastGroup ? true : expandedSkills.has(group.skill.step_id);
            const isSkillCurrent = isStreaming && isLastGroup && group.steps.length === 0;
            return /* @__PURE__ */ jsxs("li", { className: "ais-reasoning-skill", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => toggleSkill(group.skill.step_id),
                  className: "ais-reasoning-skill-toggle",
                  "aria-expanded": isSkillOpen,
                  children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "ais-reasoning-label",
                        isSkillCurrent && "ais-reasoning-label--active"
                      ),
                      children: group.skill.label
                    }
                  )
                }
              ),
              isSkillOpen && group.steps.length > 0 && /* @__PURE__ */ jsx("div", { className: "ais-reasoning-substeps", children: /* @__PURE__ */ jsx("ol", { className: "ais-reasoning-steps", children: group.steps.map((step, stepIdx) => {
                const isCurrentStep = isStreaming && isLastGroup && stepIdx === group.steps.length - 1;
                const hasDetail = !!step.detail;
                const isStepOpen = expandedSteps.has(step.step_id);
                return /* @__PURE__ */ jsx("li", { className: "ais-reasoning-step", children: hasDetail ? (
                  /* Collapsible step (has Level 3 detail) */
                  /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleStep(step.step_id),
                        className: "ais-reasoning-row ais-reasoning-row--button",
                        "aria-expanded": isStepOpen,
                        children: [
                          /* @__PURE__ */ jsx(
                            ChevronDown,
                            {
                              className: cn(
                                "ais-reasoning-chevron",
                                !isStepOpen && "ais-reasoning-chevron--collapsed"
                              ),
                              "aria-hidden": true
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              className: cn(
                                "ais-reasoning-step-label",
                                isCurrentStep && "ais-reasoning-step-label--current"
                              ),
                              children: step.label
                            }
                          ),
                          typeof step.duration_ms === "number" && !isStreaming && /* @__PURE__ */ jsx("span", { className: "ais-reasoning-duration", children: formatDuration(step.duration_ms) })
                        ]
                      }
                    ),
                    isStepOpen && /* @__PURE__ */ jsx("div", { className: "ais-reasoning-detail", children: step.detail.split("\n").map((line, i) => /* @__PURE__ */ jsx("div", { children: line }, i)) })
                  ] })
                ) : (
                  /* Non-collapsible step */
                  /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-row", children: [
                    /* @__PURE__ */ jsx("div", { className: "ais-reasoning-chevron-spacer", "aria-hidden": true }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: cn(
                          "ais-reasoning-step-label",
                          isCurrentStep && "ais-reasoning-step-label--current"
                        ),
                        children: step.label
                      }
                    ),
                    typeof step.duration_ms === "number" && !isStreaming && /* @__PURE__ */ jsx("span", { className: "ais-reasoning-duration", children: formatDuration(step.duration_ms) })
                  ] })
                ) }, step.step_id);
              }) }) })
            ] }, group.skill.step_id);
          }),
          !isStreaming && steps.length > 0 && /* @__PURE__ */ jsx("li", { className: "ais-reasoning-done", children: /* @__PURE__ */ jsx("span", { className: "ais-reasoning-step-label", children: "Reasoning complete" }) })
        ] })
      ) : (
        /* Flat fallback — no triage / no handoff events */
        /* @__PURE__ */ jsxs("ol", { className: "ais-reasoning-steps ais-reasoning-steps--flat", children: [
          steps.map((step, index) => {
            const isCurrentStep = isStreaming && index === steps.length - 1;
            return /* @__PURE__ */ jsx(
              "li",
              {
                className: cn(
                  "ais-reasoning-step ais-reasoning-step--flat",
                  !isCurrentStep && !isStreaming && "ais-reasoning-step--past"
                ),
                children: /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-step-body", children: [
                  /* @__PURE__ */ jsxs("div", { className: "ais-reasoning-row", children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: cn(
                          "ais-reasoning-step-label",
                          isCurrentStep && "ais-reasoning-step-label--current"
                        ),
                        children: step.label
                      }
                    ),
                    typeof step.duration_ms === "number" && !isStreaming && /* @__PURE__ */ jsx("span", { className: "ais-reasoning-duration", children: formatDuration(step.duration_ms) })
                  ] }),
                  step.detail && /* @__PURE__ */ jsx("span", { className: "ais-reasoning-detail--inline", children: step.detail })
                ] })
              },
              step.step_id
            );
          }),
          !isStreaming && /* @__PURE__ */ jsx("li", { className: "ais-reasoning-step ais-reasoning-done", children: /* @__PURE__ */ jsx("span", { className: "ais-reasoning-step-label", children: "Reasoning complete" }) })
        ] })
      )
    ] }) })
  ] });
}
function SparkleIcon({ spinning, className }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": true,
      className: cn(spinning && "ais-spin", className),
      children: /* @__PURE__ */ jsx("path", { d: "M12 1L9.5 9.5L1 12L9.5 14.5L12 23L14.5 14.5L23 12L14.5 9.5Z" })
    }
  );
}
function remarkInlineCitations() {
  return function transformer(tree) {
    function walk(node) {
      if (node.type === "code" || node.type === "inlineCode") return;
      if (!Array.isArray(node.children)) return;
      const newChildren = [];
      for (const child of node.children) {
        if (child.type === "code" || child.type === "inlineCode") {
          newChildren.push(child);
          continue;
        }
        if (child.type !== "text") {
          walk(child);
          newChildren.push(child);
          continue;
        }
        const parts = child.value.split(/(\[\d+\])/);
        if (parts.length === 1) {
          newChildren.push(child);
          continue;
        }
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!part) continue;
          if (i % 2 === 0) {
            newChildren.push({ type: "text", value: part });
          } else {
            const n = part.slice(1, -1);
            newChildren.push({
              type: "citeRef",
              data: {
                hName: "span",
                hProperties: { className: `ais-cite-ref-${n}` }
              },
              children: [{ type: "text", value: n }]
            });
          }
        }
      }
      node.children = newChildren;
    }
    walk(tree);
  };
}
var REMARK_PLUGINS = [remarkGfm, remarkInlineCitations];
function ChatMessage({
  message,
  onRetry,
  onRetryMessage,
  onFollowUp,
  artifactsCtx,
  sourcesCtx,
  onRecordClick,
  renderMessageFooter,
  showSuggestions,
  isPinned,
  hideMessageActions,
  canResolveToolApprovals,
  onResolveToolApproval
}) {
  const { config, strings } = useChatContext();
  const enableArtifacts = config?.enableArtifacts ?? true;
  const [copied, setCopied] = React16.useState(false);
  const copiedTimerRef = React16.useRef(null);
  React16.useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    []
  );
  const { cleanedContent, extractedArtifacts } = React16.useMemo(() => {
    if (message.role !== "assistant" || !message.content) {
      return { cleanedContent: message.content, extractedArtifacts: [] };
    }
    if (!enableArtifacts) {
      const { cleanedContent: afterSuggestions2 } = extractSuggestionsFromContent(message.content);
      return {
        cleanedContent: afterSuggestions2,
        extractedArtifacts: []
      };
    }
    const result = extractArtifactsFromContent(message.content, message.id);
    const { cleanedContent: afterSuggestions } = extractSuggestionsFromContent(
      result.cleanedContent
    );
    return {
      cleanedContent: afterSuggestions,
      extractedArtifacts: result.artifacts
    };
  }, [message.content, message.role, message.id, enableArtifacts]);
  const { registerArtifacts } = artifactsCtx;
  React16.useEffect(() => {
    if (enableArtifacts && extractedArtifacts.length > 0) {
      registerArtifacts(extractedArtifacts);
    }
  }, [extractedArtifacts, registerArtifacts, enableArtifacts]);
  const handleCiteClick = React16.useCallback(
    (scrollToIndex) => {
      if (message.sources?.length) {
        sourcesCtx.openSources(message.id, message.sources, scrollToIndex);
      }
    },
    [message.id, message.sources, sourcesCtx]
  );
  const markdownComponents = React16.useMemo(
    () => ({
      span({ node, children, className, ...props }) {
        const cls = className ?? "";
        if (/^ais-cite-ref-\d+$/.test(cls)) {
          const n = parseInt(cls.replace("ais-cite-ref-", ""), 10);
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ais-cite-marker",
              "aria-label": `View source ${n}`,
              onClick: () => handleCiteClick(n - 1),
              children: /* @__PURE__ */ jsx("sup", { children: n })
            }
          );
        }
        return /* @__PURE__ */ jsx("span", { className, ...props, children });
      }
    }),
    [handleCiteClick]
  );
  if (message.role === "command") {
    return /* @__PURE__ */ jsx("div", { className: "ais-command-pill-row", children: /* @__PURE__ */ jsxs(
      "span",
      {
        className: "ais-command-pill",
        role: "status",
        "aria-label": `Slash command: ${message.content}`,
        "data-testid": `command-message-${message.id}`,
        children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "/" }),
          message.content.replace("/", "")
        ]
      }
    ) });
  }
  const isUser = message.role === "user";
  const allArtifactIds = Array.from(
    /* @__PURE__ */ new Set([...message.artifactIds ?? [], ...extractedArtifacts.map((a) => a.artifactId)])
  );
  const hasSources = !isUser && !message.isStreaming && (message.sources?.length ?? 0) > 0;
  const customFooter = !isUser && !message.isStreaming ? renderMessageFooter?.(message) : null;
  const handleCopyMessage = React16.useCallback(() => {
    if (!message.content) return;
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : void 0;
    if (!clipboard?.writeText) return;
    clipboard.writeText(message.content).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
    });
  }, [message.content]);
  return /* @__PURE__ */ jsxs("div", { className: `ais-message-row ${isUser ? "ais-user" : "ais-assistant"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "ais-message-bubble", children: [
      !isUser ? /* @__PURE__ */ jsx(
        ReasoningBlock,
        {
          elapsedMs: message.elapsedMs,
          isStreaming: Boolean(message.isStreaming),
          plan: message.plan,
          steps: message.steps ?? []
        }
      ) : null,
      cleanedContent || message.isStreaming ? /* @__PURE__ */ jsx("div", { className: "ais-message-content", children: /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: REMARK_PLUGINS, components: markdownComponents, children: cleanedContent }) }) : null,
      message.error ? /* @__PURE__ */ jsx("p", { className: "ais-message-error", children: message.error }) : null,
      !isUser && message.stoppedByUser ? /* @__PURE__ */ jsx("p", { className: "ais-message-stopped", children: "You stopped this response." }) : null,
      !isUser && !message.isStreaming && message.error ? /* @__PURE__ */ jsxs("button", { type: "button", className: "ais-retry-btn", onClick: onRetry, children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ jsx("polyline", { points: "23 4 23 10 17 10" }),
              /* @__PURE__ */ jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
            ]
          }
        ),
        "Retry"
      ] }) : null,
      !isUser && !message.isStreaming && enableArtifacts && allArtifactIds.length ? allArtifactIds.map((id) => {
        const artifact = artifactsCtx.artifacts.get(id) || extractedArtifacts.find((a) => a.artifactId === id);
        return /* @__PURE__ */ jsx(
          ArtifactChip,
          {
            artifact,
            isSaved: Boolean(artifact?.savedRecord),
            onClick: () => artifactsCtx.openArtifact(id)
          },
          id
        );
      }) : null,
      !isUser && !message.isStreaming && message.records?.length ? message.records.map((record, i) => /* @__PURE__ */ jsx(RecordChip, { record, onClick: onRecordClick }, i)) : null,
      hasSources ? /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "ais-sources-pill",
          "aria-label": `View ${message.sources.length} sources`,
          onClick: () => handleCiteClick(void 0),
          children: [
            "\u{1F517} ",
            message.sources.length,
            " ",
            message.sources.length === 1 ? "Source" : "Sources"
          ]
        }
      ) : null,
      !isUser && message.toolApprovals?.length ? message.toolApprovals.map((approval) => /* @__PURE__ */ jsx(
        ToolApprovalCard,
        {
          approval,
          canResolve: Boolean(canResolveToolApprovals && onResolveToolApproval),
          onResolve: (a, decision, reason) => onResolveToolApproval?.(a, decision, reason),
          strings
        },
        approval.approvalId
      )) : null,
      !isUser && !message.isStreaming && message.contextRequired ? /* @__PURE__ */ jsx(ContextRequiredChips, { contextRequired: message.contextRequired, onSelect: onFollowUp }) : null,
      !isUser && !message.isStreaming && showSuggestions && message.suggestions?.length ? /* @__PURE__ */ jsx(FollowUpSuggestions, { onSelect: onFollowUp, suggestions: message.suggestions }) : null,
      customFooter ? /* @__PURE__ */ jsx("div", { className: "ais-message-custom-footer", children: customFooter }) : null
    ] }),
    !message.isStreaming && !hideMessageActions ? /* @__PURE__ */ jsxs("div", { className: "ais-msg-actions", "data-pinned": isPinned ? "true" : "false", children: [
      isUser && onRetryMessage ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ais-msg-action-btn",
          "aria-label": "Retry this message",
          onClick: () => onRetryMessage(message.id),
          children: /* @__PURE__ */ jsxs(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ jsx("polyline", { points: "23 4 23 10 17 10" }),
                /* @__PURE__ */ jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
              ]
            }
          )
        }
      ) : null,
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `ais-msg-action-btn${copied ? " ais-copied" : ""}`,
          "aria-label": copied ? "Copied" : "Copy message",
          onClick: handleCopyMessage,
          children: copied ? /* @__PURE__ */ jsx(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" })
            }
          ) : /* @__PURE__ */ jsxs(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
                /* @__PURE__ */ jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
              ]
            }
          )
        }
      )
    ] }) : null
  ] });
}
function ChatMessages({
  artifactsCtx,
  sourcesCtx,
  onRecordClick,
  renderMessageFooter,
  emptyState,
  hideMessageActions
}) {
  const {
    messages,
    retryLastMessage,
    retryMessage,
    sendMessage,
    isStreaming,
    canResolveToolApprovals,
    resolveToolApproval
  } = useChat();
  const { anchorRef, isAtBottom, scrollToBottom } = useStickyBottom();
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom("auto");
    }
  }, [isAtBottom, messages.length, scrollToBottom]);
  if (messages.length === 0) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "ais-messages ais-messages--empty",
        role: "main",
        "aria-label": "Start a new conversation",
        children: emptyState ?? /* @__PURE__ */ jsx(ChatEmptyState, { onSendMessage: (msg) => void sendMessage(msg) })
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "ais-messages", role: "log", "aria-live": "polite", "aria-label": "Conversation", children: [
    /* @__PURE__ */ jsx("div", { className: "ais-messages-blur-top" }),
    /* @__PURE__ */ jsxs("div", { className: "ais-messages-inner", children: [
      messages.map((message, index) => {
        const isLastAssistant = index === messages.length - 1 && message.role === "assistant";
        const isPinned = (() => {
          for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m && !m.isStreaming && m.role !== "command") {
              return m.id === message.id;
            }
          }
          return false;
        })();
        return /* @__PURE__ */ jsx(
          ChatMessage,
          {
            artifactsCtx,
            sourcesCtx,
            message,
            isPinned,
            showSuggestions: isLastAssistant,
            hideMessageActions,
            onFollowUp: (value) => {
              void sendMessage(value);
            },
            onRetry: () => {
              void retryLastMessage();
            },
            onRetryMessage: isStreaming ? void 0 : (messageId) => {
              void retryMessage(messageId);
            },
            onRecordClick,
            renderMessageFooter,
            canResolveToolApprovals,
            onResolveToolApproval: resolveToolApproval
          },
          message.id
        );
      }),
      /* @__PURE__ */ jsx("div", { ref: anchorRef })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "ais-messages-blur-bottom" })
  ] });
}
function LoadingSkeleton({ lines = 3 }) {
  return /* @__PURE__ */ jsx("div", { className: "ais-loading-skeleton", children: Array.from({ length: lines }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "ais-loading-line" }, index)) });
}
function TypingIndicator() {
  return /* @__PURE__ */ jsxs("div", { className: "ais-typing-indicator", "aria-live": "polite", role: "status", children: [
    /* @__PURE__ */ jsx("span", {}),
    /* @__PURE__ */ jsx("span", {}),
    /* @__PURE__ */ jsx("span", {})
  ] });
}
function RecentSessionItem({
  session,
  isActive,
  onClick,
  onDelete,
  formatDate,
  variant = "list"
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(session.sessionId);
    setMenuOpen(false);
  };
  if (variant === "sidebar") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: `ais-recent-session-wrapper ${isActive ? "is-active" : ""} ${menuOpen ? "is-menu-open" : ""}`,
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              role: "listitem",
              className: `ais-recent-session ${isActive ? "is-active" : ""}`,
              onClick,
              type: "button",
              title: session.title,
              children: /* @__PURE__ */ jsx("span", { className: "ais-recent-title", children: session.title })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "ais-recent-actions", ref: menuRef, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `ais-recent-more-btn ${menuOpen ? "is-open" : ""}`,
                onClick: toggleMenu,
                type: "button",
                "aria-label": "More options",
                children: /* @__PURE__ */ jsx(MoreVertical, { size: 14 })
              }
            ),
            menuOpen && /* @__PURE__ */ jsx("div", { className: "ais-recent-menu", children: /* @__PURE__ */ jsxs(
              "button",
              {
                className: "ais-recent-menu-item is-danger",
                onClick: handleDelete,
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(Trash2, { size: 14 }),
                  /* @__PURE__ */ jsx("span", { children: "Delete" })
                ]
              }
            ) })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `ais-recents-item-wrapper ${isActive ? "is-active" : ""} ${menuOpen ? "is-menu-open" : ""}`,
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `ais-recents-item ${isActive ? "is-active" : ""}`,
            onClick,
            type: "button",
            children: [
              /* @__PURE__ */ jsx("span", { className: "ais-recents-item-title", children: session.title }),
              /* @__PURE__ */ jsx("span", { className: "ais-recents-item-date", children: formatDate(session.updatedAt) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "ais-recent-actions", ref: menuRef, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `ais-recent-more-btn ${menuOpen ? "is-open" : ""}`,
              onClick: toggleMenu,
              type: "button",
              "aria-label": "More options",
              children: /* @__PURE__ */ jsx(MoreVertical, { size: 16 })
            }
          ),
          menuOpen && /* @__PURE__ */ jsx("div", { className: "ais-recent-menu", children: /* @__PURE__ */ jsxs("button", { className: "ais-recent-menu-item is-danger", onClick: handleDelete, type: "button", children: [
            /* @__PURE__ */ jsx(Trash2, { size: 14 }),
            /* @__PURE__ */ jsx("span", { children: "Delete" })
          ] }) })
        ] })
      ]
    }
  );
}
function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDanger = false
}) {
  const [portalContainer, setPortalContainer] = React16.useState(null);
  React16.useEffect(() => {
    const host = document.querySelector('[data-chat-provider="ai-chat-sdk"]');
    setPortalContainer(host);
  }, []);
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { open: isOpen, onOpenChange, children: /* @__PURE__ */ jsxs(DialogPrimitive.Portal, { container: portalContainer ?? void 0, children: [
    /* @__PURE__ */ jsx(DialogPrimitive.Overlay, { className: "ais-confirm-overlay" }),
    /* @__PURE__ */ jsxs(DialogPrimitive.Content, { className: "ais-confirm-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "ais-confirm-header", children: [
        /* @__PURE__ */ jsx(DialogPrimitive.Title, { className: "ais-confirm-title", children: title }),
        /* @__PURE__ */ jsx(DialogPrimitive.Description, { className: "ais-confirm-description", children: description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ais-confirm-footer", children: [
        /* @__PURE__ */ jsx(DialogPrimitive.Close, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "ais-confirm-btn ais-cancel", type: "button", children: cancelLabel }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `ais-confirm-btn ${isDanger ? "ais-danger" : "ais-primary"}`,
            onClick: () => {
              onConfirm();
              onOpenChange(false);
            },
            type: "button",
            children: confirmLabel
          }
        )
      ] }),
      /* @__PURE__ */ jsx(DialogPrimitive.Close, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "ais-confirm-close", "aria-label": "Close", type: "button", children: /* @__PURE__ */ jsx(X, { size: 16 }) }) })
    ] })
  ] }) });
}
function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
function getGroupLabel(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Older";
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "Previous 7 days";
  if (diffDays < 30) return "Previous 30 days";
  return "Older";
}
var GROUP_ORDER = ["Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"];
function RecentsPage({ onSelectSession, onNewConversation }) {
  const { adapter } = useChatContext();
  const { sessions, isLoading, deleteSession } = useConversationHistory();
  const { loadSession, currentSessionId, clearMessages } = useChat();
  const [query, setQuery] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const handleDeleteSession = (sessionId) => {
    setSessionToDelete(sessionId);
  };
  const confirmDelete = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      if (sessionToDelete === currentSessionId) {
        if (onNewConversation) {
          onNewConversation();
        } else {
          clearMessages();
        }
      }
      setSessionToDelete(null);
    }
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, query]);
  const groups = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const label of GROUP_ORDER) {
      map.set(label, []);
    }
    for (const session of filtered) {
      const label = getGroupLabel(session.updatedAt);
      const bucket = map.get(label) ?? [];
      bucket.push(session);
      map.set(label, bucket);
    }
    for (const [label, items] of map.entries()) {
      if (items.length === 0) map.delete(label);
    }
    return map;
  }, [filtered]);
  async function handleSelect(session) {
    try {
      const full = await adapter.loadSession(session.sessionId);
      loadSession(full);
      onSelectSession?.();
    } catch {
      clearMessages();
      onNewConversation?.();
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "ais-recents-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "ais-recents-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "ais-recents-title", children: "Chats" }),
      /* @__PURE__ */ jsxs("div", { className: "ais-recents-search-wrap", children: [
        /* @__PURE__ */ jsx(Search, { size: 15, className: "ais-recents-search-icon" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "ais-recents-search",
            type: "search",
            placeholder: "Search chats...",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            "aria-label": "Search chats"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ais-recents-list", children: [
      isLoading && /* @__PURE__ */ jsx("div", { className: "ais-recents-empty", children: /* @__PURE__ */ jsx("p", { children: "Loading..." }) }),
      !isLoading && filtered.length === 0 && /* @__PURE__ */ jsxs("div", { className: "ais-recents-empty", children: [
        /* @__PURE__ */ jsx(MessageCircle, { size: 36, strokeWidth: 1.4 }),
        /* @__PURE__ */ jsx("p", { children: query ? "No chats match your search." : "No conversations yet." })
      ] }),
      !isLoading && GROUP_ORDER.filter((label) => groups.has(label)).map((label) => /* @__PURE__ */ jsxs("div", { className: "ais-recents-group", children: [
        /* @__PURE__ */ jsx("div", { className: "ais-recents-group-label", children: label }),
        groups.get(label).map((session) => /* @__PURE__ */ jsx(
          RecentSessionItem,
          {
            session,
            isActive: session.sessionId === currentSessionId,
            onClick: () => void handleSelect(session),
            onDelete: handleDeleteSession,
            formatDate: formatRelativeDate,
            variant: "list"
          },
          session.sessionId
        ))
      ] }, label)),
      /* @__PURE__ */ jsx(
        ConfirmDialog,
        {
          isOpen: !!sessionToDelete,
          onOpenChange: (open) => !open && setSessionToDelete(null),
          title: "Delete conversation",
          description: "Are you sure you want to delete this conversation? This action cannot be undone.",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          onConfirm: confirmDelete,
          isDanger: true
        }
      )
    ] })
  ] });
}
function getSourceLabel(source) {
  if (source.url) {
    try {
      const url = new URL(source.url);
      const domain = url.hostname.replace(/^www\./, "");
      return domain;
    } catch {
      return "External Link";
    }
  }
  if (source.type === "database") return "Database Record";
  const title = source.title || "";
  const lastDotIndex = title.lastIndexOf(".");
  if (lastDotIndex !== -1 && lastDotIndex > title.length - 6) {
    const ext = title.substring(lastDotIndex + 1).toUpperCase();
    if (["PDF", "DOCX", "TXT", "MD", "CSV", "XLSX"].includes(ext)) {
      return `${ext} Document`;
    }
  }
  return "Knowledge Base";
}
function SourceCard({ source, index, cardRef }) {
  const isDatabase = source.type === "database";
  const accentColor = isDatabase ? "#7C3AED" : "#2563EB";
  const label = getSourceLabel(source);
  const content = /* @__PURE__ */ jsxs(
    "div",
    {
      ref: cardRef,
      className: "ais-sp-card",
      style: { "--sp-accent": accentColor },
      id: `ais-cite-card-${index + 1}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-sp-card-header", children: [
          /* @__PURE__ */ jsxs("div", { className: "ais-sp-card-meta", children: [
            /* @__PURE__ */ jsx("span", { className: "ais-sp-card-icon", children: isDatabase ? /* @__PURE__ */ jsx(Database, { size: 12 }) : /* @__PURE__ */ jsx(FileText, { size: 12 }) }),
            /* @__PURE__ */ jsx("span", { className: "ais-sp-card-label", children: label }),
            source.page != null && /* @__PURE__ */ jsxs("span", { className: "ais-sp-card-page", children: [
              "Page ",
              source.page
            ] })
          ] }),
          source.url && /* @__PURE__ */ jsx(ExternalLink, { size: 12, className: "ais-sp-card-external" })
        ] }),
        /* @__PURE__ */ jsx("h4", { className: "ais-sp-card-title", children: source.title }),
        source.snippet ? /* @__PURE__ */ jsx("div", { className: "ais-sp-card-body", children: source.snippet }) : !isDatabase && /* @__PURE__ */ jsx("div", { className: "ais-sp-card-body", style: { opacity: 0.5, fontStyle: "italic" }, children: "No preview available" }),
        source.retrievalScore != null && /* @__PURE__ */ jsx("div", { className: "ais-sp-card-footer", children: /* @__PURE__ */ jsxs("div", { className: "ais-sp-card-relevance", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-sp-card-relevance-bar-bg", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "ais-sp-card-relevance-bar-fill",
              style: { width: `${Math.round(source.retrievalScore * 100)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("span", { children: [
            Math.round(source.retrievalScore * 100),
            "% relevance"
          ] })
        ] }) })
      ]
    }
  );
  if (source.url) {
    return /* @__PURE__ */ jsx("a", { href: source.url, target: "_blank", rel: "noopener noreferrer", className: "ais-sp-card-anchor", children: content });
  }
  return content;
}
function SourcesPanel({ sourcesCtx, className }) {
  const { activeSources, panelState, closeSources } = sourcesCtx;
  const panelRef = useRef(null);
  useEffect(() => {
    if (!panelState.isOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") closeSources();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelState.isOpen, closeSources]);
  useEffect(() => {
    if (panelState.isOpen) {
      panelRef.current?.focus();
    }
  }, [panelState.isOpen]);
  const cardRefMap = useRef(/* @__PURE__ */ new Map());
  const setCardRef = React16.useCallback(
    (index) => (el) => {
      if (el) {
        cardRefMap.current.set(index, el);
      } else {
        cardRefMap.current.delete(index);
      }
    },
    []
  );
  useEffect(() => {
    if (!panelState.isOpen || panelState.scrollToIndex == null) return;
    const el = cardRefMap.current.get(panelState.scrollToIndex);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [panelState.isOpen, panelState.scrollToIndex]);
  if (!panelState.isOpen) return null;
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      ref: panelRef,
      className: `ais-sources-panel ais-animate-sources-panel-in ${className ?? ""}`,
      role: "complementary",
      "aria-label": "Sources panel",
      tabIndex: -1,
      children: [
        /* @__PURE__ */ jsxs("header", { className: "ais-sp-header", children: [
          /* @__PURE__ */ jsx("h3", { className: "ais-sp-title", children: "Sources" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              "aria-label": "Close sources panel",
              className: "ais-sp-close",
              onClick: closeSources,
              type: "button",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ais-sp-body", children: activeSources.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "ais-sp-empty", children: [
          /* @__PURE__ */ jsx(Search, { size: 24, style: { marginBottom: 12, opacity: 0.2 } }),
          /* @__PURE__ */ jsx("p", { children: "No cited sources found for this message." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "ais-sp-cards", children: activeSources.map((source, i) => /* @__PURE__ */ jsx(SourceCard, { source, index: i, cardRef: setCardRef(i) }, source.id)) }) })
      ]
    }
  );
}
function StatusBadge({ status }) {
  if (status === "uploaded") return null;
  const label = status === "processed" ? "analyzed" : "error";
  return /* @__PURE__ */ jsx("span", { className: `ais-fp-file-badge ais-fp-file-badge--${status}`, children: label });
}
function FileRow({
  file,
  onDelete,
  onDownload
}) {
  return /* @__PURE__ */ jsxs("div", { className: "ais-fp-file-row", children: [
    /* @__PURE__ */ jsx("span", { className: "ais-fp-file-icon", "aria-hidden": "true", children: fileIcon(file.mimeType, 15) }),
    /* @__PURE__ */ jsxs("div", { className: "ais-fp-file-info", children: [
      /* @__PURE__ */ jsx("span", { className: "ais-fp-file-name", title: file.fileName, children: file.fileName }),
      /* @__PURE__ */ jsxs("div", { className: "ais-fp-file-meta", children: [
        /* @__PURE__ */ jsx("span", { className: "ais-fp-file-size", children: formatBytes(file.size) }),
        /* @__PURE__ */ jsx(StatusBadge, { status: file.status })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ais-fp-file-actions", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "ais-fp-file-action-btn",
          onClick: () => onDownload(file),
          type: "button",
          title: "Download",
          "aria-label": `Download ${file.fileName}`,
          children: /* @__PURE__ */ jsx(Download, { size: 14 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "ais-fp-file-action-btn ais-fp-file-action-btn--danger",
          onClick: () => onDelete(file.id),
          type: "button",
          title: "Remove",
          "aria-label": `Remove ${file.fileName}`,
          children: /* @__PURE__ */ jsx(Trash2, { size: 14 })
        }
      )
    ] })
  ] });
}
function FilesPanel({ filesCtx, className }) {
  const { files, isLoading, panelOpen, closePanel, deleteFile, downloadFile } = filesCtx;
  useEffect(() => {
    if (!panelOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, closePanel]);
  if (!panelOpen) return null;
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `ais-files-panel ais-animate-sources-panel-in ${className ?? ""}`,
      role: "complementary",
      "aria-label": "Session files",
      tabIndex: -1,
      children: [
        /* @__PURE__ */ jsxs("header", { className: "ais-sp-header", children: [
          /* @__PURE__ */ jsxs("h3", { className: "ais-sp-title", children: [
            "Files",
            files.length > 0 && /* @__PURE__ */ jsx("span", { className: "ais-fp-count", children: files.length })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              "aria-label": "Close files panel",
              className: "ais-sp-close",
              onClick: closePanel,
              type: "button",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ais-sp-body", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "ais-sp-empty", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-fp-loading-row" }),
          /* @__PURE__ */ jsx("div", { className: "ais-fp-loading-row", style: { width: "70%" } }),
          /* @__PURE__ */ jsx("div", { className: "ais-fp-loading-row", style: { width: "85%" } })
        ] }) : files.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "ais-sp-empty", children: [
          /* @__PURE__ */ jsx("p", { children: "No files attached to this session." }),
          /* @__PURE__ */ jsx("p", { style: { fontSize: 12, opacity: 0.5, marginTop: 4 }, children: "Use the + button in the composer to upload files." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "ais-fp-file-list", children: files.map((f) => /* @__PURE__ */ jsx(FileRow, { file: f, onDelete: deleteFile, onDownload: downloadFile }, f.id)) }) })
      ]
    }
  );
}
function ChatShellHeader({
  sessionTitle,
  onOpenMenu,
  filesCount = 0,
  filesPanelOpen = false,
  onToggleFiles,
  artifactsCount = 0,
  artifactsPanelOpen = false,
  onToggleArtifacts
}) {
  return /* @__PURE__ */ jsxs("header", { className: "ais-shell-header", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        "aria-label": "Open menu",
        className: "ais-shell-menu-toggle",
        onClick: onOpenMenu,
        type: "button",
        children: /* @__PURE__ */ jsx(Menu, { size: 18 })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "ais-shell-header-title", title: sessionTitle, children: sessionTitle }),
    (onToggleArtifacts || onToggleFiles) && /* @__PURE__ */ jsxs("div", { className: "ais-shell-header-actions", children: [
      onToggleArtifacts && artifactsCount > 0 && /* @__PURE__ */ jsxs(
        "button",
        {
          "aria-label": artifactsPanelOpen ? "Close artifacts panel" : "Open artifacts panel",
          "aria-pressed": artifactsPanelOpen,
          className: `ais-shell-header-artifacts-btn ais-shell-header-action-btn${artifactsPanelOpen ? " is-active" : ""}`,
          onClick: onToggleArtifacts,
          type: "button",
          title: "Artifacts",
          children: [
            /* @__PURE__ */ jsx(Info, { size: 15 }),
            /* @__PURE__ */ jsx("span", { className: "ais-shell-header-files-count", children: artifactsCount })
          ]
        }
      ),
      onToggleFiles && /* @__PURE__ */ jsxs(
        "button",
        {
          "aria-label": filesPanelOpen ? "Close files panel" : "Open files panel",
          "aria-pressed": filesPanelOpen,
          className: `ais-shell-header-files-btn ais-shell-header-action-btn${filesPanelOpen ? " is-active" : ""}`,
          onClick: onToggleFiles,
          type: "button",
          title: "Session files",
          children: [
            /* @__PURE__ */ jsx(File, { size: 15 }),
            filesCount > 0 && /* @__PURE__ */ jsx("span", { className: "ais-shell-header-files-count", children: filesCount })
          ]
        }
      )
    ] })
  ] });
}
var SIDEBAR_OVERLAY_BREAKPOINT_PX = 1024;
function ChatSidebar({
  onNewConversation,
  isOpen,
  onToggle,
  className,
  activeView = "chat",
  onViewChange,
  artifactPanelOpen,
  onToggleArtifacts,
  hideArtifactsLink = false,
  sidebarLinks = []
}) {
  const { adapter, organizationId, currentSession, setCurrentSession } = useChatContext();
  const { sessions, isLoading, refresh, deleteSession } = useConversationHistory();
  const { loadSession, currentSessionId, isStreaming, clearMessages, messages } = useChat();
  const [collapsed, setCollapsed] = useState(() => {
    const persisted = window.localStorage.getItem("ais-chat-sidebar-collapsed");
    if (persisted === "1") return true;
    if (persisted === "0") return false;
    return window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX;
  });
  const [recentsCollapsed, setRecentsCollapsed] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const isStreamingRef = React16.useRef(isStreaming);
  const prevArtifactOpenRef = React16.useRef(void 0);
  const displaySessions = useMemo(() => {
    const hasCurrent = sessions.some((s) => s.sessionId === currentSessionId);
    if (currentSessionId && !hasCurrent) {
      const userMsg = messages.find((m) => m.role === "user")?.content;
      if (userMsg) {
        const title = userMsg.length > 50 ? userMsg.substring(0, 47) + "..." : userMsg;
        const optimisticSession = {
          sessionId: currentSessionId,
          title,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "active"
        };
        return [optimisticSession, ...sessions];
      }
    }
    return sessions;
  }, [sessions, currentSessionId, messages]);
  useEffect(() => {
    if (artifactPanelOpen && !prevArtifactOpenRef.current) {
      setCollapsed(true);
    }
    prevArtifactOpenRef.current = artifactPanelOpen;
  }, [artifactPanelOpen]);
  const handleDeleteSession = (sessionId) => {
    setSessionToDelete(sessionId);
  };
  const confirmDelete = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      if (sessionToDelete === currentSessionId) {
        if (onNewConversation) {
          onNewConversation();
        } else {
          clearMessages();
        }
      }
      setSessionToDelete(null);
    }
  };
  useEffect(() => {
    if (isStreamingRef.current && !isStreaming) {
      const isKnownSession = sessions.some((s) => s.sessionId === currentSessionId);
      if (!isKnownSession && currentSessionId) {
        void refresh();
      }
    }
    isStreamingRef.current = isStreaming;
  }, [isStreaming, sessions, currentSessionId, refresh]);
  useEffect(() => {
    if (!currentSessionId || !currentSession || isStreaming) return;
    const matchingSession = sessions.find((s) => s.sessionId === currentSessionId);
    if (matchingSession && matchingSession.title !== currentSession.title) {
      setCurrentSession({
        ...currentSession,
        title: matchingSession.title
      });
    }
  }, [sessions, currentSessionId, currentSession, setCurrentSession, isStreaming]);
  useEffect(() => {
    if (!isOpen) return;
    if (window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX) {
      setCollapsed(false);
    }
  }, [isOpen]);
  useEffect(() => {
    window.localStorage.setItem("ais-chat-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  const topNavItems = useMemo(() => {
    const items = [
      {
        id: "new-chat",
        label: "New Chat",
        icon: Plus,
        action: () => {
          onNewConversation?.();
          onViewChange?.("chat");
        }
      },
      {
        id: "search",
        label: "Search",
        icon: Search,
        action: () => {
          window.dispatchEvent(new CustomEvent("ais-open-command-palette"));
        }
      },
      {
        id: "recents",
        label: "Chats",
        icon: MessageCircle,
        active: activeView === "recents",
        action: () => onViewChange?.("recents")
      }
    ];
    if (!hideArtifactsLink) {
      items.push({
        id: "artifacts",
        label: "Artifacts",
        icon: FileText,
        active: artifactPanelOpen,
        action: () => {
          onToggleArtifacts?.();
        }
      });
    }
    for (const link of sidebarLinks) {
      items.push({
        id: link.id,
        label: link.label,
        icon: link.icon ?? ExternalLink,
        action: link.onClick
      });
    }
    return items;
  }, [
    onNewConversation,
    onViewChange,
    activeView,
    onToggleArtifacts,
    artifactPanelOpen,
    hideArtifactsLink,
    sidebarLinks
  ]);
  function renderRailButton(item) {
    const Icon = item.icon;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        className: `ais-sidebar-nav-item ${item.active ? "is-active" : ""} ${collapsed ? "is-collapsed" : ""}`,
        onClick: () => {
          item.action?.();
          if (isOpen && onToggle) onToggle();
        },
        type: "button",
        title: item.label,
        "aria-label": item.label,
        children: [
          /* @__PURE__ */ jsx(Icon, { size: 18, strokeWidth: 1.9 }),
          /* @__PURE__ */ jsx("span", { className: "ais-sidebar-nav-label", children: item.label }),
          item.id === "search" && !collapsed && /* @__PURE__ */ jsx("span", { className: "ais-sidebar-nav-shortcut", children: "\u2318K" })
        ]
      },
      item.id
    );
  }
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `ais-sidebar ${collapsed ? "is-collapsed" : ""} ${isOpen ? "is-mobile-open" : ""} ${className ?? ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-sidebar-header", children: [
          /* @__PURE__ */ jsx("div", { className: "ais-sidebar-brand", children: /* @__PURE__ */ jsx("div", { className: "ais-sidebar-brand-title", children: "anter" }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "ais-sidebar-toggle",
              onClick: () => {
                if (window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX && onToggle) {
                  onToggle();
                } else {
                  setCollapsed((prev) => !prev);
                }
              },
              type: "button",
              "aria-label": collapsed ? "Open sidebar" : "Close sidebar",
              title: collapsed ? "Open sidebar" : "Close sidebar",
              children: collapsed ? /* @__PURE__ */ jsx(PanelLeftOpen, { size: 18 }) : /* @__PURE__ */ jsx(PanelLeftClose, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: `ais-sidebar-nav-list ${collapsed ? "is-collapsed" : ""}`, children: topNavItems.map((item) => renderRailButton(item)) }),
        (!collapsed || isOpen) && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `ais-sidebar-content-area ${recentsCollapsed ? "is-recents-collapsed" : ""}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "ais-sidebar-section-header", children: [
                /* @__PURE__ */ jsx("div", { className: "ais-sidebar-section-label", children: "Recents" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "ais-sidebar-section-toggle",
                    onClick: () => setRecentsCollapsed((prev) => !prev),
                    type: "button",
                    children: recentsCollapsed ? "Show" : "Hide"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "ais-sidebar-recents", role: "list", "aria-label": "Recent conversations", children: [
                isLoading ? /* @__PURE__ */ jsx("p", { className: "ais-sidebar-hint", children: "Loading..." }) : null,
                !isLoading && displaySessions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "ais-sidebar-hint", children: "No conversations yet" }) : null,
                displaySessions.map((session) => /* @__PURE__ */ jsx(
                  RecentSessionItem,
                  {
                    session,
                    isActive: session.sessionId === currentSessionId,
                    onClick: async () => {
                      try {
                        const full = await adapter.loadSession(session.sessionId);
                        loadSession(full);
                        if (isOpen && onToggle) onToggle();
                      } catch {
                        void refresh();
                        clearMessages();
                        onNewConversation?.();
                      }
                    },
                    onDelete: handleDeleteSession,
                    formatDate: (d) => d,
                    variant: "sidebar"
                  },
                  session.sessionId
                ))
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          ConfirmDialog,
          {
            isOpen: !!sessionToDelete,
            onOpenChange: (open) => !open && setSessionToDelete(null),
            title: "Delete conversation",
            description: "Are you sure you want to delete this conversation? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            onConfirm: confirmDelete,
            isDanger: true
          }
        )
      ]
    }
  );
}
var ResizablePanelGroup = ResizablePrimitive.Group;
var ResizablePanel = ResizablePrimitive.Panel;
function ResizableHandle({
  className = "",
  withHandle = false,
  ...props
}) {
  return /* @__PURE__ */ jsx(ResizablePrimitive.Separator, { className: `ais-resizable-handle ${className}`, ...props, children: withHandle && /* @__PURE__ */ jsx("div", { className: "ais-resizable-handle-icon", children: /* @__PURE__ */ jsx(GripVertical, { size: 12 }) }) });
}
var SIDEBAR_OVERLAY_BREAKPOINT_PX2 = 1024;
function ChatShell({
  onExportArtifact,
  onRecordClick,
  renderMessageFooter,
  recordPanel,
  className,
  style,
  viewportOffset,
  initialSessionId,
  onSessionChange,
  emptyState,
  tips = [],
  onArtifactsClick,
  hideArtifactsLink,
  sidebarLinks,
  hideMessageActions
}) {
  const { config } = useChatContext();
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();
  return /* @__PURE__ */ jsx(ChatStateProvider, { onArtifactsReady: artifactsCtx.registerArtifacts, children: /* @__PURE__ */ jsx(
    ChatShellContent,
    {
      artifactsCtx,
      sourcesCtx,
      filesCtx,
      enableFileUpload: config.enableFileUpload,
      onExportArtifact,
      onRecordClick,
      renderMessageFooter,
      recordPanel,
      className,
      style,
      viewportOffset,
      initialSessionId,
      onSessionChange,
      emptyState,
      tips,
      onArtifactsClick,
      hideArtifactsLink,
      sidebarLinks,
      hideMessageActions
    }
  ) });
}
function ChatShellContent({
  onExportArtifact,
  onRecordClick,
  renderMessageFooter,
  recordPanel,
  className,
  style,
  viewportOffset,
  initialSessionId,
  onSessionChange,
  artifactsCtx,
  sourcesCtx,
  filesCtx,
  enableFileUpload,
  emptyState,
  tips = [],
  onArtifactsClick,
  hideArtifactsLink,
  sidebarLinks,
  hideMessageActions
}) {
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    clearMessages,
    loadSession,
    adapter,
    currentSessionId,
    currentSessionTitle,
    resumeState,
    resumeRun
  } = useChat();
  const { setTopBanner, setBottomBanner, config } = useChatContext();
  React16.useEffect(() => {
    if (!tips.length) return;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    if (randomTip) {
      if (randomTip.position === "top") {
        setTopBanner(randomTip);
      } else {
        setBottomBanner(randomTip);
      }
    }
  }, [setBottomBanner, setTopBanner, tips]);
  React16.useEffect(() => {
    const BUILT_IN_COMMANDS = [
      {
        id: "shell:new-conversation",
        label: "New Conversation",
        description: "Start a fresh chat session",
        onExecute: () => {
          handleNewConversation();
        }
      },
      {
        id: "shell:view-recents",
        label: "Recent Conversations",
        description: "Browse your conversation history",
        onExecute: () => {
          handleViewChange("recents");
        }
      }
    ];
    BUILT_IN_COMMANDS.forEach(registerCommand);
    return () => BUILT_IN_COMMANDS.forEach((c) => unregisterCommand(c.id));
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOverlayViewport, setIsOverlayViewport] = useState(
    () => typeof window !== "undefined" ? window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX2 : false
  );
  const didLoadInitialRef = React16.useRef(false);
  React16.useEffect(() => {
    if (!initialSessionId) return;
    if (initialSessionId === currentSessionId) {
      didLoadInitialRef.current = true;
      return;
    }
    if (didLoadInitialRef.current) return;
    didLoadInitialRef.current = true;
    adapter.loadSession(initialSessionId).then((session) => {
      loadSession(session);
    }).catch(() => {
      onSessionChange?.(void 0);
    });
  }, [initialSessionId, currentSessionId, adapter, loadSession, onSessionChange]);
  const prevSessionIdRef = React16.useRef(void 0);
  React16.useEffect(() => {
    if (currentSessionId === void 0 && prevSessionIdRef.current === void 0) return;
    if (currentSessionId === prevSessionIdRef.current) return;
    prevSessionIdRef.current = currentSessionId;
    onSessionChange?.(currentSessionId);
  }, [currentSessionId, onSessionChange]);
  React16.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      const nextIsOverlay = window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX2;
      setIsOverlayViewport(nextIsOverlay);
      if (!nextIsOverlay) {
        setSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const embedPanelIsOpen = !!recordPanel || config.enableArtifacts && artifactsCtx.panelState.isOpen;
  const filesOpen = enableFileUpload && filesCtx.panelOpen;
  const innerRightPanelIsOpen = sourcesCtx.panelState.isOpen || filesOpen;
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = filesOpen && !sourcesCtx.panelState.isOpen;
  const innerRightPanelDefaultSize = showSourcesPanel ? 25 : 30;
  const mainPanelDefaultSize = 100 - innerRightPanelDefaultSize;
  const layoutStorageKey = `ais-chat-layout-${showSourcesPanel ? "sources" : "files"}`;
  const [savedLayout, setSavedLayout] = useState(() => {
    if (typeof window === "undefined") return void 0;
    const saved = window.localStorage.getItem(layoutStorageKey);
    return saved ? JSON.parse(saved) : void 0;
  });
  const handleLayoutChanged = React16.useCallback(
    (layout) => {
      if (!innerRightPanelIsOpen || typeof window === "undefined") return;
      const layoutKeys = Object.keys(layout);
      const isSame = savedLayout && layoutKeys.length === Object.keys(savedLayout).length && layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedLayout[k] ?? 0)) < 0.01);
      if (isSame) return;
      setSavedLayout(layout);
      window.localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
    },
    [innerRightPanelIsOpen, savedLayout, layoutStorageKey]
  );
  React16.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(layoutStorageKey);
    setSavedLayout(saved ? JSON.parse(saved) : void 0);
  }, [layoutStorageKey]);
  const outerLayoutStorageKey = "ais-shell-layout";
  const [savedOuterLayout, setSavedOuterLayout] = useState(
    () => {
      if (typeof window === "undefined") return void 0;
      const saved = window.localStorage.getItem(outerLayoutStorageKey);
      return saved ? JSON.parse(saved) : void 0;
    }
  );
  const handleOuterLayoutChanged = React16.useCallback(
    (layout) => {
      if (!embedPanelIsOpen || typeof window === "undefined") return;
      const layoutKeys = Object.keys(layout);
      const isSame = savedOuterLayout && layoutKeys.length === Object.keys(savedOuterLayout).length && layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedOuterLayout[k] ?? 0)) < 0.01);
      if (isSame) return;
      setSavedOuterLayout(layout);
      window.localStorage.setItem(outerLayoutStorageKey, JSON.stringify(layout));
    },
    [embedPanelIsOpen, savedOuterLayout]
  );
  React16.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(outerLayoutStorageKey);
    const parsed = saved ? JSON.parse(saved) : void 0;
    if (parsed && parsed["embed-panel"] == null) {
      window.localStorage.removeItem(outerLayoutStorageKey);
      setSavedOuterLayout(void 0);
    } else {
      setSavedOuterLayout(parsed);
    }
  }, []);
  const [activeView, setActiveView] = useState("chat");
  function handleViewChange(view) {
    setActiveView(view);
    setSidebarOpen(false);
  }
  function handleNewConversation() {
    clearMessages();
    setActiveView("chat");
  }
  const sessionTitle = currentSessionTitle?.trim() || "New session";
  const shellRef = React16.useRef(null);
  useViewportHeightFallback(shellRef);
  const shellStyle = {
    ...viewportOffset?.top != null ? { "--ais-chrome-offset-top": `${viewportOffset.top}px` } : {},
    ...viewportOffset?.bottom != null ? { "--ais-chrome-offset-bottom": `${viewportOffset.bottom}px` } : {},
    ...style
  };
  return /* @__PURE__ */ jsxs("div", { ref: shellRef, className: `ais-chat-shell ${className ?? ""}`, style: shellStyle, children: [
    /* @__PURE__ */ jsx(
      ChatSidebar,
      {
        activeView,
        isOpen: isOverlayViewport ? sidebarOpen : false,
        onNewConversation: handleNewConversation,
        onToggle: () => setSidebarOpen((prev) => !prev),
        onViewChange: handleViewChange,
        artifactPanelOpen: artifactsCtx.panelState.isOpen,
        onToggleArtifacts: onArtifactsClick || (() => artifactsCtx.panelState.isOpen ? artifactsCtx.closePanel() : artifactsCtx.openArtifact(Array.from(artifactsCtx.artifacts.keys())[0] ?? "")),
        hideArtifactsLink,
        sidebarLinks
      }
    ),
    /* @__PURE__ */ jsxs(
      ResizablePanelGroup,
      {
        orientation: "horizontal",
        className: "ais-resizable-group",
        defaultLayout: savedOuterLayout,
        onLayoutChanged: handleOuterLayoutChanged,
        children: [
          /* @__PURE__ */ jsx(
            ResizablePanel,
            {
              id: "chat-content",
              defaultSize: savedOuterLayout?.["chat-content"] ?? 50,
              minSize: 30,
              className: "ais-resizable-panel",
              children: /* @__PURE__ */ jsxs("div", { className: "ais-chat-content", children: [
                /* @__PURE__ */ jsx(
                  ChatShellHeader,
                  {
                    onOpenMenu: () => setSidebarOpen(true),
                    sessionTitle,
                    artifactsCount: artifactsCtx.artifacts.size,
                    artifactsPanelOpen: artifactsCtx.panelState.isOpen,
                    onToggleArtifacts: () => artifactsCtx.panelState.isOpen ? artifactsCtx.closePanel() : artifactsCtx.openArtifact(Array.from(artifactsCtx.artifacts.keys())[0] ?? ""),
                    filesCount: enableFileUpload ? filesCtx.files.length : 0,
                    onToggleFiles: enableFileUpload ? () => filesCtx.panelOpen ? filesCtx.closePanel() : filesCtx.openPanel() : void 0,
                    filesPanelOpen: filesOpen
                  }
                ),
                /* @__PURE__ */ jsxs(
                  ResizablePanelGroup,
                  {
                    orientation: "horizontal",
                    className: "ais-resizable-group",
                    defaultLayout: savedLayout,
                    onLayoutChanged: handleLayoutChanged,
                    children: [
                      /* @__PURE__ */ jsx(
                        ResizablePanel,
                        {
                          id: "chat-main",
                          defaultSize: savedLayout?.["chat-main"] ?? mainPanelDefaultSize,
                          maxSize: 80,
                          minSize: 20,
                          className: "ais-resizable-panel",
                          children: /* @__PURE__ */ jsx("main", { className: "ais-chat-main", children: activeView === "recents" ? /* @__PURE__ */ jsx(
                            RecentsPage,
                            {
                              onSelectSession: () => setActiveView("chat"),
                              onNewConversation: handleNewConversation
                            }
                          ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                            /* @__PURE__ */ jsx(
                              ChatMessages,
                              {
                                artifactsCtx,
                                sourcesCtx,
                                onRecordClick,
                                renderMessageFooter,
                                emptyState,
                                hideMessageActions
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              ChatComposer,
                              {
                                isStreaming,
                                onStop: stopStreaming,
                                resumeState,
                                onResume: () => void resumeRun(),
                                onSendMessage: (message, attachedFileIds, sessionId, extraContextVariables) => {
                                  void sendMessage(
                                    message,
                                    attachedFileIds,
                                    sessionId,
                                    extraContextVariables
                                  );
                                }
                              }
                            )
                          ] }) })
                        },
                        "chat-main"
                      ),
                      innerRightPanelIsOpen && /* @__PURE__ */ jsx(
                        ResizablePanel,
                        {
                          id: "right-panel",
                          defaultSize: savedLayout?.["right-panel"] ?? innerRightPanelDefaultSize,
                          maxSize: 40,
                          minSize: 15,
                          className: "ais-resizable-panel",
                          children: showSourcesPanel ? /* @__PURE__ */ jsx(SourcesPanel, { sourcesCtx }) : showFilesPanel && /* @__PURE__ */ jsx(FilesPanel, { filesCtx })
                        },
                        "right-panel"
                      )
                    ]
                  },
                  `resizable-group-${innerRightPanelIsOpen}-${showSourcesPanel}`
                )
              ] })
            },
            "chat-content"
          ),
          embedPanelIsOpen && /* @__PURE__ */ jsx(ResizableHandle, { withHandle: true }),
          embedPanelIsOpen && /* @__PURE__ */ jsx(
            ResizablePanel,
            {
              id: "embed-panel",
              defaultSize: savedOuterLayout?.["embed-panel"] ?? 50,
              minSize: 30,
              className: "ais-resizable-panel",
              children: /* @__PURE__ */ jsx("div", { className: "ais-embed-panel", children: recordPanel ?? (config.enableArtifacts && artifactsCtx.panelState.isOpen && /* @__PURE__ */ jsx(
                ArtifactPanel,
                {
                  artifactsCtx,
                  onExportArtifact,
                  onSendMessage: (text) => void sendMessage(text),
                  isStreaming
                }
              )) })
            },
            "embed-panel"
          )
        ]
      },
      `shell-resizable-group-${embedPanelIsOpen}`
    ),
    isOverlayViewport && sidebarOpen && /* @__PURE__ */ jsx("div", { className: "ais-mobile-sidebar-backdrop", onClick: () => setSidebarOpen(false) }),
    config.enableCommandPalette && /* @__PURE__ */ jsx(CommandPalette, {})
  ] });
}
function RecordPanel({ subject, iframeSrc, externalHref, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  return /* @__PURE__ */ jsxs("aside", { className: "ais-record-panel", "aria-label": "Record panel", role: "complementary", children: [
    /* @__PURE__ */ jsxs("header", { className: "ais-rp-header", children: [
      /* @__PURE__ */ jsx("span", { className: "ais-rp-title", children: subject.replace(/-/g, " ") }),
      /* @__PURE__ */ jsxs("div", { className: "ais-rp-actions", children: [
        externalHref && /* @__PURE__ */ jsx(
          "a",
          {
            href: externalHref,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "ais-rp-action-btn",
            "aria-label": "Open in new tab",
            children: /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "ais-rp-action-btn",
            "aria-label": "Close record panel",
            children: /* @__PURE__ */ jsx(X, { size: 16 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "ais-rp-body", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        src: iframeSrc,
        className: "ais-rp-iframe",
        title: "Record viewer",
        sandbox: "allow-scripts allow-same-origin allow-popups"
      },
      iframeSrc
    ) })
  ] });
}
function resolveFullChatUrl(fullChatUrl, sessionId) {
  const url = fullChatUrl(sessionId).trim();
  if (!url || url === "#") {
    return null;
  }
  return url;
}
function ChatWidget({
  position = "bottom-right",
  initialOpen = false,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  title,
  subtitle,
  emptyState,
  trigger,
  brand,
  brandIcon
}) {
  return /* @__PURE__ */ jsx(ChatStateProvider, { children: /* @__PURE__ */ jsx(
    ChatWidgetContent,
    {
      position,
      initialOpen,
      fullChatUrl,
      onNavigate,
      onExportArtifact,
      title,
      subtitle,
      emptyState,
      trigger,
      brand,
      brandIcon
    }
  ) });
}
function ChatWidgetContent({
  position = "bottom-right",
  initialOpen = false,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  title,
  subtitle,
  emptyState,
  trigger,
  brand,
  brandIcon
}) {
  const [open, setOpen] = useState(initialOpen);
  const { config, orgLabel } = useChatContext();
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    currentSessionId,
    clearMessages,
    messages,
    resumeState,
    resumeRun
  } = useChat();
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();
  const hasMessages = messages.length > 0;
  const fullChatHref = resolveFullChatUrl(fullChatUrl, currentSessionId ?? null);
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = config.enableFileUpload && filesCtx.panelOpen && !showSourcesPanel;
  const showArtifactPanel = config.enableArtifacts && artifactsCtx.panelState.isOpen && !showSourcesPanel && !showFilesPanel;
  const isAnyPanelOpen = showSourcesPanel || showFilesPanel || showArtifactPanel;
  const widgetTitle = title ?? orgLabel ?? "AI Assistant";
  return /* @__PURE__ */ jsx("div", { className: `ais-widget-root ${position}`, children: /* @__PURE__ */ jsxs(Popover.Root, { onOpenChange: setOpen, open, children: [
    /* @__PURE__ */ jsx(Popover.Trigger, { asChild: true, children: trigger ? typeof trigger === "function" ? trigger({ open }) : trigger : /* @__PURE__ */ jsxs(
      "button",
      {
        "aria-label": open ? "Close AI widget" : "Open AI widget",
        className: "ais-widget-trigger",
        type: "button",
        children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ais-widget-trigger-orbit" }),
          /* @__PURE__ */ jsx("span", { className: "ais-widget-trigger-icon-wrap", children: /* @__PURE__ */ jsx(MessageCircle, { size: 19 }) }),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ais-widget-trigger-ping" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Popover.Portal, { children: /* @__PURE__ */ jsxs(
      Popover.Content,
      {
        className: "ais-widget-popover",
        "data-chat-provider": "ai-chat-sdk",
        "data-theme": config.theme,
        sideOffset: 10,
        children: [
          /* @__PURE__ */ jsxs("header", { className: "ais-widget-header", children: [
            brand ? brand : /* @__PURE__ */ jsxs("div", { className: "ais-widget-brand", children: [
              brandIcon ? brandIcon : /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ais-widget-brand-badge", children: /* @__PURE__ */ jsx(Sparkles, { size: 13 }) }),
              /* @__PURE__ */ jsxs("div", { className: "ais-widget-brand-text", children: [
                /* @__PURE__ */ jsx("strong", { className: "ais-widget-title", children: widgetTitle }),
                subtitle && /* @__PURE__ */ jsx("span", { className: "ais-widget-subtitle", children: subtitle })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "ais-widget-header-actions", children: [
              config.enableFileUpload && /* @__PURE__ */ jsxs(
                "button",
                {
                  "aria-label": filesCtx.panelOpen ? "Close files" : "Open files",
                  title: "Session files",
                  onClick: () => filesCtx.panelOpen ? filesCtx.closePanel() : filesCtx.openPanel(),
                  type: "button",
                  className: filesCtx.panelOpen ? "is-active" : "",
                  children: [
                    /* @__PURE__ */ jsx(Paperclip, { size: 14 }),
                    filesCtx.files.length > 0 && /* @__PURE__ */ jsx("span", { className: "ais-widget-header-badge", children: filesCtx.files.length })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "New chat",
                  title: "New chat",
                  onClick: clearMessages,
                  type: "button",
                  disabled: !hasMessages,
                  className: !hasMessages ? "is-disabled" : "",
                  children: /* @__PURE__ */ jsx(Plus, { size: 14 })
                }
              ),
              fullChatHref && /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Open full chat",
                  title: "Open full chat",
                  onClick: () => onNavigate(fullChatHref),
                  type: "button",
                  children: /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Close chat widget",
                  title: "Close chat widget",
                  onClick: () => setOpen(false),
                  type: "button",
                  children: /* @__PURE__ */ jsx(X, { size: 14 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "ais-widget-body", children: [
            /* @__PURE__ */ jsx(
              ChatMessages,
              {
                artifactsCtx,
                sourcesCtx,
                emptyState
              }
            ),
            isAnyPanelOpen && /* @__PURE__ */ jsxs("div", { className: "ais-widget-drawer", children: [
              showSourcesPanel && /* @__PURE__ */ jsx(SourcesPanel, { sourcesCtx }),
              showFilesPanel && /* @__PURE__ */ jsx(FilesPanel, { filesCtx }),
              showArtifactPanel && /* @__PURE__ */ jsx(
                ArtifactPanel,
                {
                  artifactsCtx,
                  onExportArtifact,
                  onSendMessage: (text) => void sendMessage(text),
                  isStreaming
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            ChatComposer,
            {
              isStreaming,
              onStop: stopStreaming,
              resumeState,
              onResume: () => void resumeRun(),
              onSendMessage: (message, attachedFileIds, sessionId, extraContextVariables) => {
                void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
              }
            }
          )
        ]
      }
    ) })
  ] }) });
}
function resolveFullChatUrl2(fullChatUrl, sessionId) {
  if (!fullChatUrl) return null;
  const url = fullChatUrl(sessionId ?? null).trim();
  if (!url || url === "#") {
    return null;
  }
  return url;
}
function ChatSidepanel(props) {
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();
  return /* @__PURE__ */ jsx(ChatStateProvider, { onArtifactsReady: artifactsCtx.registerArtifacts, children: /* @__PURE__ */ jsx(
    ChatSidepanelContent,
    {
      artifactsCtx,
      sourcesCtx,
      filesCtx,
      ...props
    }
  ) });
}
function ChatSidepanelContent({
  title,
  subtitle,
  brand,
  brandIcon,
  onClose,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  emptyState,
  className = "",
  artifactsCtx,
  sourcesCtx,
  filesCtx
}) {
  const { adapter, config, orgLabel } = useChatContext();
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    currentSessionId,
    clearMessages,
    messages,
    resumeState,
    resumeRun,
    loadSession
  } = useChat();
  const { sessions, isLoading: historyLoading, refresh: refreshHistory } = useConversationHistory();
  const [recentsMenuOpen, setRecentsMenuOpen] = useState(false);
  const [recentsView, setRecentsView] = useState("main");
  const recentsMenuRef = useRef(null);
  useEffect(() => {
    if (!recentsMenuOpen) return;
    const handleClickOutside = (e) => {
      if (recentsMenuRef.current && !recentsMenuRef.current.contains(e.target)) {
        setRecentsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [recentsMenuOpen]);
  const handleToggleRecents = () => {
    if (!recentsMenuOpen) {
      void refreshHistory();
      setRecentsView("main");
    }
    setRecentsMenuOpen((prev) => !prev);
  };
  const hasMessages = messages.length > 0;
  const fullChatHref = resolveFullChatUrl2(fullChatUrl, currentSessionId);
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = config.enableFileUpload && filesCtx.panelOpen && !showSourcesPanel;
  const showArtifactPanel = config.enableArtifacts && artifactsCtx.panelState.isOpen && !showSourcesPanel && !showFilesPanel;
  const isAnyPanelOpen = showSourcesPanel || showFilesPanel || showArtifactPanel;
  const sidepanelTitle = title ?? orgLabel ?? "";
  return /* @__PURE__ */ jsxs("div", { className: `ais-sidepanel-root ${className}`, children: [
    /* @__PURE__ */ jsxs("header", { className: "ais-sidepanel-header", children: [
      brand ? brand : /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-brand", children: [
        brandIcon ? brandIcon : /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "ais-sidepanel-brand-badge", children: /* @__PURE__ */ jsx(Sparkles, { size: 13 }) }),
        /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-brand-text", children: [
          /* @__PURE__ */ jsx("strong", { className: "ais-sidepanel-title", children: sidepanelTitle }),
          subtitle && /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-subtitle", children: subtitle })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-header-actions", children: [
        /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-recents-menu-wrapper", ref: recentsMenuRef, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              "aria-label": "Recent chats",
              title: "Recent chats",
              onClick: handleToggleRecents,
              type: "button",
              className: recentsMenuOpen ? "is-active" : "",
              children: /* @__PURE__ */ jsx(MoreVertical, { size: 14 })
            }
          ),
          recentsMenuOpen && /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown", children: recentsView === "main" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown-header", children: "Recent Chats" }),
            /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-recents-dropdown-list", children: [
              historyLoading && /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown-loading", children: "Loading..." }),
              !historyLoading && sessions.length === 0 && /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown-empty", children: "No recent chats" }),
              !historyLoading && sessions.slice(0, 5).map((session) => /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `ais-sidepanel-recents-dropdown-item ${session.sessionId === currentSessionId ? "is-active" : ""}`,
                  onClick: async () => {
                    setRecentsMenuOpen(false);
                    try {
                      const full = await adapter.loadSession(session.sessionId);
                      loadSession(full);
                    } catch (err) {
                      console.error("Failed to load session:", err);
                    }
                  },
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx(MessageSquare, { size: 13, className: "ais-sidepanel-recents-item-icon" }),
                    /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-recents-dropdown-item-title", children: session.title })
                  ]
                },
                session.sessionId
              )),
              !historyLoading && sessions.length > 5 && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "ais-sidepanel-recents-dropdown-item is-more",
                  onClick: () => setRecentsView("more"),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx(MoreHorizontal, { size: 13, className: "ais-sidepanel-recents-item-icon" }),
                    /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-recents-dropdown-item-title", children: "More" }),
                    /* @__PURE__ */ jsx(ChevronRight, { size: 13, className: "ais-sidepanel-recents-item-arrow" })
                  ]
                }
              )
            ] }),
            fullChatHref && onNavigate && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown-divider" }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "ais-sidepanel-recents-dropdown-item is-action",
                  onClick: () => {
                    setRecentsMenuOpen(false);
                    onNavigate(fullChatHref);
                  },
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx(ExternalLink, { size: 13, className: "ais-sidepanel-recents-item-icon" }),
                    /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-recents-dropdown-item-title", children: "Continue Chat in New Tab" })
                  ]
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "ais-sidepanel-recents-dropdown-back-btn",
                onClick: () => setRecentsView("main"),
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
                  /* @__PURE__ */ jsx("span", { children: "Back" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "ais-sidepanel-recents-dropdown-list", children: sessions.slice(5).map((session) => /* @__PURE__ */ jsxs(
              "button",
              {
                className: `ais-sidepanel-recents-dropdown-item ${session.sessionId === currentSessionId ? "is-active" : ""}`,
                onClick: async () => {
                  setRecentsMenuOpen(false);
                  try {
                    const full = await adapter.loadSession(session.sessionId);
                    loadSession(full);
                  } catch (err) {
                    console.error("Failed to load session:", err);
                  }
                },
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(MessageSquare, { size: 13, className: "ais-sidepanel-recents-item-icon" }),
                  /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-recents-dropdown-item-title", children: session.title })
                ]
              },
              session.sessionId
            )) })
          ] }) })
        ] }),
        config.enableFileUpload && /* @__PURE__ */ jsxs(
          "button",
          {
            "aria-label": filesCtx.panelOpen ? "Close files" : "Open files",
            title: "Session files",
            onClick: () => filesCtx.panelOpen ? filesCtx.closePanel() : filesCtx.openPanel(),
            type: "button",
            className: filesCtx.panelOpen ? "is-active" : "",
            children: [
              /* @__PURE__ */ jsx(Paperclip, { size: 14 }),
              filesCtx.files.length > 0 && /* @__PURE__ */ jsx("span", { className: "ais-sidepanel-header-badge", children: filesCtx.files.length })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "New chat",
            title: "New chat",
            onClick: clearMessages,
            type: "button",
            disabled: !hasMessages,
            className: !hasMessages ? "is-disabled" : "",
            children: /* @__PURE__ */ jsx(Plus, { size: 14 })
          }
        ),
        fullChatHref && onNavigate && /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Open full chat",
            title: "Open full chat",
            onClick: () => onNavigate(fullChatHref),
            type: "button",
            children: /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
          }
        ),
        onClose && /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Close side panel",
            title: "Close side panel",
            onClick: onClose,
            type: "button",
            children: /* @__PURE__ */ jsx(X, { size: 14 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `ais-sidepanel-main ${isAnyPanelOpen ? "ais-has-drawer" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-body", children: [
        /* @__PURE__ */ jsx(
          ChatMessages,
          {
            artifactsCtx,
            sourcesCtx,
            emptyState
          }
        ),
        isAnyPanelOpen && /* @__PURE__ */ jsxs("div", { className: "ais-sidepanel-drawer", children: [
          showSourcesPanel && /* @__PURE__ */ jsx(SourcesPanel, { sourcesCtx }),
          showFilesPanel && /* @__PURE__ */ jsx(FilesPanel, { filesCtx }),
          showArtifactPanel && /* @__PURE__ */ jsx(
            ArtifactPanel,
            {
              artifactsCtx,
              onExportArtifact,
              onSendMessage: (text) => void sendMessage(text),
              isStreaming
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        ChatComposer,
        {
          isStreaming,
          onStop: stopStreaming,
          resumeState,
          onResume: () => void resumeRun(),
          onSendMessage: (message, attachedFileIds, sessionId, extraContextVariables) => {
            void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
          }
        }
      )
    ] })
  ] });
}
var SIDEBAR_OVERLAY_BREAKPOINT_PX3 = 1024;
var clampSize = (value, lo, hi) => Math.min(Math.max(value, lo), hi);
var getSafeLayout = (storageKey) => {
  if (typeof window === "undefined") return void 0;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : void 0;
  } catch (e) {
    return void 0;
  }
};
function ChatSidepanelLayout({
  children,
  sidepanel,
  isOpen,
  onClose,
  defaultWidth = 30,
  minWidth = 20,
  maxWidth = 50,
  storageKey = "ais-sidepanel-layout",
  className = "",
  ariaLabel = "AI Assistant Panel"
}) {
  const [isOverlayViewport, setIsOverlayViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX3;
  });
  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window === "undefined") return 1200;
    return window.innerWidth;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setIsOverlayViewport(window.innerWidth <= SIDEBAR_OVERLAY_BREAKPOINT_PX3);
      setViewportWidth(window.innerWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [savedLayout, setSavedLayout] = useState(
    () => getSafeLayout(storageKey)
  );
  const handleLayoutChanged = useCallback(
    (layout) => {
      if (!isOpen || isOverlayViewport || typeof window === "undefined") return;
      const layoutKeys = Object.keys(layout);
      const isSame = savedLayout && layoutKeys.length === Object.keys(savedLayout).length && layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedLayout[k] ?? 0)) < 0.01);
      if (isSame) return;
      setSavedLayout(layout);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(layout));
      } catch (e) {
      }
    },
    [isOpen, isOverlayViewport, savedLayout, storageKey]
  );
  useEffect(() => {
    setSavedLayout(getSafeLayout(storageKey));
  }, [storageKey]);
  const sidepanelRef = useRef(null);
  const prevOpenRef = useRef(false);
  const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  useEffect(() => {
    if (!isOpen || !isOverlayViewport) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isOverlayViewport, onClose]);
  const handleMobileKeyDown = (e) => {
    if (!isOverlayViewport) return;
    if (e.key === "Tab" && sidepanelRef.current) {
      const focusable = sidepanelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
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
  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (!justOpened || !isOverlayViewport) return;
    const node = sidepanelRef.current;
    if (!node) return;
    const firstFocusable = node.querySelectorAll(FOCUSABLE_SELECTOR)[0];
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      node.focus();
    }
  }, [isOpen, isOverlayViewport]);
  const computedMinSize = viewportWidth > 0 ? Math.min(maxWidth, Math.max(minWidth, 320 / viewportWidth * 100)) : minWidth;
  const sidepanelSize = clampSize(
    savedLayout?.["sidepanel"] ?? defaultWidth,
    computedMinSize,
    maxWidth
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `ais-sidepanel-layout-root ${isOverlayViewport ? "ais-mobile" : "ais-desktop"} ${isOpen ? "ais-panel-open" : ""} ${className}`,
      style: { height: "100%", width: "100%", position: "relative" },
      children: [
        /* @__PURE__ */ jsxs(
          ResizablePanelGroup,
          {
            orientation: "horizontal",
            className: "ais-sidepanel-layout-container",
            defaultLayout: savedLayout,
            onLayoutChanged: handleLayoutChanged,
            children: [
              /* @__PURE__ */ jsx(
                ResizablePanel,
                {
                  id: "host",
                  minSize: `${100 - maxWidth}%`,
                  className: "ais-sidepanel-host-pane",
                  children
                },
                "host"
              ),
              isOpen && /* @__PURE__ */ jsx(ResizableHandle, { withHandle: true, className: "ais-sidepanel-resize-handle" }),
              isOpen && /* @__PURE__ */ jsx(
                ResizablePanel,
                {
                  id: "sidepanel",
                  defaultSize: `${sidepanelSize}%`,
                  minSize: `${computedMinSize}%`,
                  maxSize: `${maxWidth}%`,
                  className: "ais-sidepanel-chat-pane",
                  role: isOverlayViewport ? "dialog" : void 0,
                  "aria-modal": isOverlayViewport ? "true" : void 0,
                  "aria-label": isOverlayViewport ? ariaLabel : void 0,
                  tabIndex: isOverlayViewport ? -1 : void 0,
                  elementRef: sidepanelRef,
                  onKeyDown: handleMobileKeyDown,
                  children: sidepanel
                },
                "sidepanel"
              )
            ]
          }
        ),
        isOpen && isOverlayViewport && /* @__PURE__ */ jsx("div", { className: "ais-mobile-sidebar-backdrop", onClick: onClose, style: { zIndex: 140 } })
      ]
    }
  );
}
function ChatView({
  onExportArtifact,
  onRecordClick,
  renderMessageFooter,
  recordPanel,
  className,
  style,
  initialSessionId,
  onSessionChange,
  emptyState,
  tips = [],
  hideMessageActions
}) {
  const { config } = useChatContext();
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();
  return /* @__PURE__ */ jsx(ChatStateProvider, { onArtifactsReady: artifactsCtx.registerArtifacts, children: /* @__PURE__ */ jsx(
    ChatViewContent,
    {
      artifactsCtx,
      sourcesCtx,
      filesCtx,
      enableFileUpload: config.enableFileUpload,
      onExportArtifact,
      onRecordClick,
      renderMessageFooter,
      recordPanel,
      className,
      style,
      initialSessionId,
      onSessionChange,
      emptyState,
      tips,
      hideMessageActions
    }
  ) });
}
function ChatViewContent({
  onExportArtifact,
  onRecordClick,
  renderMessageFooter,
  recordPanel,
  className,
  style,
  initialSessionId,
  onSessionChange,
  artifactsCtx,
  sourcesCtx,
  filesCtx,
  enableFileUpload,
  emptyState,
  tips = [],
  hideMessageActions
}) {
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    loadSession,
    adapter,
    currentSessionId,
    resumeState,
    resumeRun
  } = useChat();
  const { setTopBanner, setBottomBanner, config } = useChatContext();
  useEffect(() => {
    if (!tips.length) return;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    if (randomTip) {
      if (randomTip.position === "top") {
        setTopBanner(randomTip);
      } else {
        setBottomBanner(randomTip);
      }
    }
  }, [setBottomBanner, setTopBanner, tips]);
  const didLoadInitialRef = React16.useRef(false);
  useEffect(() => {
    if (!initialSessionId || didLoadInitialRef.current) return;
    didLoadInitialRef.current = true;
    adapter.loadSession(initialSessionId).then((session) => {
      loadSession(session);
    }).catch(() => {
      onSessionChange?.(void 0);
    });
  }, [initialSessionId, adapter, loadSession, onSessionChange]);
  const prevSessionIdRef = React16.useRef(void 0);
  useEffect(() => {
    if (currentSessionId === void 0 && prevSessionIdRef.current === void 0) return;
    if (currentSessionId === prevSessionIdRef.current) return;
    prevSessionIdRef.current = currentSessionId;
    onSessionChange?.(currentSessionId);
  }, [currentSessionId, onSessionChange]);
  const embedPanelIsOpen = !!recordPanel || config.enableArtifacts && artifactsCtx.panelState.isOpen;
  const filesOpen = enableFileUpload && filesCtx.panelOpen;
  const innerRightPanelIsOpen = sourcesCtx.panelState.isOpen || filesOpen;
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = filesOpen && !sourcesCtx.panelState.isOpen;
  const innerRightPanelDefaultSize = showSourcesPanel ? 25 : 30;
  const mainPanelDefaultSize = 100 - innerRightPanelDefaultSize;
  const layoutStorageKey = `ais-chat-view-layout-${showSourcesPanel ? "sources" : "files"}`;
  const [savedLayout, setSavedLayout] = useState(() => {
    if (typeof window === "undefined") return void 0;
    const saved = window.localStorage.getItem(layoutStorageKey);
    return saved ? JSON.parse(saved) : void 0;
  });
  const handleLayoutChanged = React16.useCallback(
    (layout) => {
      if (!innerRightPanelIsOpen || typeof window === "undefined") return;
      const layoutKeys = Object.keys(layout);
      const isSame = savedLayout && layoutKeys.length === Object.keys(savedLayout).length && layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedLayout[k] ?? 0)) < 0.01);
      if (isSame) return;
      setSavedLayout(layout);
      window.localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
    },
    [innerRightPanelIsOpen, savedLayout, layoutStorageKey]
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(layoutStorageKey);
    setSavedLayout(saved ? JSON.parse(saved) : void 0);
  }, [layoutStorageKey]);
  const outerLayoutStorageKey = "ais-chat-view-outer-layout";
  const [savedOuterLayout, setSavedOuterLayout] = useState(
    () => {
      if (typeof window === "undefined") return void 0;
      const saved = window.localStorage.getItem(outerLayoutStorageKey);
      return saved ? JSON.parse(saved) : void 0;
    }
  );
  const handleOuterLayoutChanged = React16.useCallback(
    (layout) => {
      if (!embedPanelIsOpen || typeof window === "undefined") return;
      const layoutKeys = Object.keys(layout);
      const isSame = savedOuterLayout && layoutKeys.length === Object.keys(savedOuterLayout).length && layoutKeys.every((k) => Math.abs((layout[k] ?? 0) - (savedOuterLayout[k] ?? 0)) < 0.01);
      if (isSame) return;
      setSavedOuterLayout(layout);
      window.localStorage.setItem(outerLayoutStorageKey, JSON.stringify(layout));
    },
    [embedPanelIsOpen, savedOuterLayout]
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(outerLayoutStorageKey);
    const parsed = saved ? JSON.parse(saved) : void 0;
    if (parsed && parsed["embed-panel"] == null) {
      window.localStorage.removeItem(outerLayoutStorageKey);
      setSavedOuterLayout(void 0);
    } else {
      setSavedOuterLayout(parsed);
    }
  }, []);
  return /* @__PURE__ */ jsx("div", { className: `ais-chat-view ${className ?? ""}`, style: { height: "100%", ...style }, children: /* @__PURE__ */ jsxs(
    ResizablePanelGroup,
    {
      orientation: "horizontal",
      className: "ais-resizable-group",
      defaultLayout: savedOuterLayout,
      onLayoutChanged: handleOuterLayoutChanged,
      children: [
        /* @__PURE__ */ jsx(
          ResizablePanel,
          {
            id: "chat-content",
            defaultSize: savedOuterLayout?.["chat-content"] ?? 50,
            minSize: 30,
            className: "ais-resizable-panel",
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "ais-chat-content",
                style: { height: "100%", display: "flex", flexDirection: "column" },
                children: /* @__PURE__ */ jsxs(
                  ResizablePanelGroup,
                  {
                    orientation: "horizontal",
                    className: "ais-resizable-group",
                    defaultLayout: savedLayout,
                    onLayoutChanged: handleLayoutChanged,
                    children: [
                      /* @__PURE__ */ jsx(
                        ResizablePanel,
                        {
                          id: "chat-main",
                          defaultSize: savedLayout?.["chat-main"] ?? mainPanelDefaultSize,
                          maxSize: 100,
                          minSize: 20,
                          className: "ais-resizable-panel",
                          children: /* @__PURE__ */ jsxs("main", { className: "ais-chat-main", children: [
                            /* @__PURE__ */ jsx(
                              ChatMessages,
                              {
                                artifactsCtx,
                                sourcesCtx,
                                onRecordClick,
                                renderMessageFooter,
                                emptyState,
                                hideMessageActions
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              ChatComposer,
                              {
                                isStreaming,
                                onStop: stopStreaming,
                                resumeState,
                                onResume: () => void resumeRun(),
                                onSendMessage: (message, attachedFileIds, sessionId, extraContextVariables) => {
                                  void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
                                }
                              }
                            )
                          ] })
                        },
                        "chat-main"
                      ),
                      innerRightPanelIsOpen && /* @__PURE__ */ jsx(
                        ResizablePanel,
                        {
                          id: "right-panel",
                          defaultSize: savedLayout?.["right-panel"] ?? innerRightPanelDefaultSize,
                          maxSize: 40,
                          minSize: 15,
                          className: "ais-resizable-panel",
                          children: showSourcesPanel ? /* @__PURE__ */ jsx(SourcesPanel, { sourcesCtx }) : showFilesPanel && /* @__PURE__ */ jsx(FilesPanel, { filesCtx })
                        },
                        "right-panel"
                      )
                    ]
                  },
                  `resizable-group-${innerRightPanelIsOpen}-${showSourcesPanel}`
                )
              }
            )
          },
          "chat-content"
        ),
        embedPanelIsOpen && /* @__PURE__ */ jsx(ResizableHandle, { withHandle: true }),
        embedPanelIsOpen && /* @__PURE__ */ jsx(
          ResizablePanel,
          {
            id: "embed-panel",
            defaultSize: savedOuterLayout?.["embed-panel"] ?? 50,
            minSize: 30,
            className: "ais-resizable-panel",
            children: /* @__PURE__ */ jsx("div", { className: "ais-embed-panel", children: recordPanel ?? (config.enableArtifacts && artifactsCtx.panelState.isOpen && /* @__PURE__ */ jsx(
              ArtifactPanel,
              {
                artifactsCtx,
                onExportArtifact,
                onSendMessage: (text) => void sendMessage(text),
                isStreaming
              }
            )) })
          },
          "embed-panel"
        )
      ]
    },
    `panel-resizable-group-${embedPanelIsOpen}`
  ) });
}

export { ArtifactChip, ArtifactPanel, ArtifactPreview, ArtifactTabs, AttachmentChipBar, ChatComposer, ChatEmptyState, ChatMessage, ChatMessages, ChatShell, ChatSidebar, ChatSidepanel, ChatSidepanelLayout, ChatView, ChatWidget, CommandPalette, ComposerBanner, ContextRequiredChips, ContextTagBar, FilesPanel, FollowUpSuggestions, LoadingSkeleton, ReasoningBlock, RecentsPage, RecordChip, RecordPanel, SlashCommandMenu, SourcesPanel, ToolApprovalCard, TypingIndicator, getArtifactRegistry, getCommandRegistry, registerArtifact, registerCommand, unregisterCommand };
//# sourceMappingURL=chunk-CVIDKNGJ.js.map
//# sourceMappingURL=chunk-CVIDKNGJ.js.map