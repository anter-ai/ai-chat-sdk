import { defaultStrings } from './chunk-TW4QYVX5.js';
import { createContext, useState, useCallback, useMemo, useContext, createElement, useEffect, useRef } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';
import { createParser } from 'eventsource-parser';

// src/extensions/slash-command-registry.ts
var builtins = [
  {
    name: "/help",
    description: "Show available commands",
    slashCommandId: "help",
    exampleUsage: "/help",
    onSelect: ({ setValue, submit }) => {
      setValue("/help");
      submit("/help");
    }
  }
];
var registry = [...builtins];
function registerSlashCommand(command) {
  if (!registry.find((r) => r.name === command.name)) {
    registry.push(command);
  }
}
function getSlashCommandRegistry() {
  return registry;
}
var ChatContext = createContext(null);
var THEME_MAP = {
  bg: "--chat-bg",
  sidebarBg: "--chat-sidebar-bg",
  artifactBg: "--artifact-bg",
  border: "--chat-border",
  accent: "--chat-accent",
  accentHover: "--chat-accent-hover",
  accentForeground: "--chat-accent-foreground",
  messageUserBg: "--message-user-bg",
  messageUserText: "--message-user-text",
  messageAiBg: "--message-ai-bg",
  messageAiText: "--message-ai-text",
  muted: "--chat-muted",
  radiusSm: "--chat-radius-sm",
  radiusMd: "--chat-radius-md",
  radiusLg: "--chat-radius-lg",
  sidebarWidth: "--chat-sidebar-width",
  artifactWidth: "--chat-artifact-width",
  floatingPanelBg: "--ais-floating-panel-bg",
  floatingPanelBorder: "--ais-floating-panel-border",
  floatingPanelCardBg: "--ais-floating-panel-card-bg"
};
function generateThemeCss(themeOptions) {
  if (!themeOptions) return "";
  let css = "";
  if (themeOptions.light) {
    css += `
[data-chat-provider="ai-chat-sdk"] {
`;
    for (const [key, value] of Object.entries(themeOptions.light)) {
      const cssVar = THEME_MAP[key];
      if (cssVar && value) {
        css += `  ${cssVar}: ${value};
`;
      }
    }
    css += `}
`;
  }
  if (themeOptions.dark) {
    const darkSelectors = [
      `[data-chat-provider="ai-chat-sdk"][data-theme="dark"]`,
      `:where(.dark) [data-chat-provider="ai-chat-sdk"]:not([data-theme="light"])`
    ];
    css += `
${darkSelectors.join(",\n")} {
`;
    for (const [key, value] of Object.entries(themeOptions.dark)) {
      const cssVar = THEME_MAP[key];
      if (cssVar && value) {
        css += `  ${cssVar}: ${value};
`;
      }
    }
    css += `}
`;
    css += `
@media (prefers-color-scheme: dark) {
  [data-chat-provider="ai-chat-sdk"]:not([data-theme="light"]) {
`;
    for (const [key, value] of Object.entries(themeOptions.dark)) {
      const cssVar = THEME_MAP[key];
      if (cssVar && value) {
        css += `    ${cssVar}: ${value};
`;
      }
    }
    css += `  }
}
`;
  }
  return css;
}
function ChatProvider({
  children,
  adapter,
  organizationId = "",
  config = {},
  strings = {},
  plugins = {},
  onSlashCommand,
  className,
  style,
  ...rest
}) {
  const [currentSession, setCurrentSession] = useState(void 0);
  const [orgLabel, setOrgLabel] = useState(void 0);
  const [activeContextId, setActiveContextId] = useState(void 0);
  const [activeContextLabel, setActiveContextLabel] = useState(void 0);
  const [topBannerOverride, setTopBannerOverride] = useState(void 0);
  const [bottomBannerOverride, setBottomBannerOverride] = useState(void 0);
  const [persistentContextVariables, setPersistentContextVariablesState] = useState({});
  const [contextReferences, setContextReferences] = useState([]);
  const addContextReference = useCallback((ref) => {
    setContextReferences((prev) => {
      const idx = prev.findIndex((r) => r.id === ref.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ref;
        return next;
      }
      return [...prev, ref];
    });
  }, []);
  const removeContextReference = useCallback((id) => {
    setContextReferences((prev) => prev.filter((r) => r.id !== id));
  }, []);
  const setActiveContext = useCallback((id, label) => {
    setActiveContextId(id);
    setActiveContextLabel(label);
  }, []);
  const setPersistentContextVariable = useCallback((key, value2) => {
    setPersistentContextVariablesState((prev) => {
      if (value2 === void 0) {
        const { [key]: _, ...rest2 } = prev;
        return rest2;
      }
      return { ...prev, [key]: value2 };
    });
  }, []);
  const setTopBanner = useCallback((announcement) => {
    setTopBannerOverride(announcement);
  }, []);
  const setBottomBanner = useCallback((announcement) => {
    setBottomBannerOverride(announcement);
  }, []);
  const topBanner = topBannerOverride !== void 0 ? topBannerOverride : plugins.composerTopBanner ?? null;
  const bottomBanner = bottomBannerOverride !== void 0 ? bottomBannerOverride : plugins.composerBottomBanner ?? null;
  const setAnnouncement = useCallback(
    (announcement) => {
      setBottomBanner(announcement);
    },
    [setBottomBanner]
  );
  const mergedConfig = {
    enableArtifacts: config.enableArtifacts ?? true,
    enableModelSelector: config.enableModelSelector ?? true,
    enableFileUpload: config.enableFileUpload ?? false,
    enableSlashCommands: config.enableSlashCommands ?? true,
    enableCommandPalette: config.enableCommandPalette ?? true,
    enableSearch: config.enableSearch ?? true,
    enableSlashFocusShortcut: config.enableSlashFocusShortcut ?? true,
    enableResumeRetry: config.enableResumeRetry ?? true,
    enableTools: config.enableTools ?? true,
    enableVoiceInput: config.enableVoiceInput ?? true,
    enableSendButton: config.enableSendButton ?? true,
    defaultModel: config.defaultModel ?? "claude-sonnet-4-6",
    theme: config.theme ?? "system",
    themeOptions: config.themeOptions ?? {}
  };
  const mergedStrings = useMemo(
    () => ({ ...defaultStrings, ...strings }),
    [strings]
  );
  const value = useMemo(
    () => ({
      adapter,
      organizationId,
      config: mergedConfig,
      strings: mergedStrings,
      plugins,
      onSlashCommand,
      currentSession,
      setCurrentSession,
      orgLabel,
      setOrgLabel,
      activeContextId,
      activeContextLabel,
      setActiveContext,
      contextReferences,
      setContextReferences,
      addContextReference,
      removeContextReference,
      topBanner,
      setTopBanner,
      bottomBanner,
      setBottomBanner,
      announcement: bottomBanner,
      setAnnouncement,
      persistentContextVariables,
      setPersistentContextVariable
    }),
    [
      adapter,
      organizationId,
      mergedConfig,
      mergedStrings,
      plugins,
      onSlashCommand,
      currentSession,
      orgLabel,
      activeContextId,
      activeContextLabel,
      setActiveContext,
      contextReferences,
      setContextReferences,
      addContextReference,
      removeContextReference,
      topBanner,
      setTopBanner,
      bottomBanner,
      setBottomBanner,
      persistentContextVariables,
      setPersistentContextVariable,
      setAnnouncement
    ]
  );
  const themeCss = useMemo(() => {
    return generateThemeCss(config.themeOptions);
  }, [config.themeOptions]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-chat-provider": "ai-chat-sdk",
      "data-theme": mergedConfig.theme,
      className,
      style,
      ...rest,
      children: [
        themeCss && /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: themeCss } }),
        /* @__PURE__ */ jsx(ChatContext.Provider, { value, children })
      ]
    }
  );
}
function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}

// src/headless/utils/record-utils.ts
var RECORD_TAG_RE = /<record\b([^>]*?)(?:\s*\/>|\s*><\/record>)/g;
var SUBJECT_RE = /\bsubject="([^"]+)"/;
var SUBJECT_ID_RE = /\bsubjectId="([^"]+)"/;
function extractRecordTagsFromContent(content) {
  const records = [];
  RECORD_TAG_RE.lastIndex = 0;
  const cleanedContent = content.replace(RECORD_TAG_RE, (_full, attrs) => {
    const subject = (attrs.match(SUBJECT_RE)?.[1] ?? "").replace(/_/g, "-");
    const subjectId = attrs.match(SUBJECT_ID_RE)?.[1] ?? "";
    if (subject && subjectId) {
      records.push({
        subject,
        subjectId,
        ids: subjectId.split(",").map((s) => s.trim()).filter(Boolean)
      });
    }
    return "";
  });
  return { cleanedContent: cleanedContent.trim(), records };
}
function useArtifacts() {
  const [artifacts, setArtifacts] = useState(/* @__PURE__ */ new Map());
  const [panelState, setPanelState] = useState({
    isOpen: false,
    activeArtifactId: void 0,
    activeTab: "preview"
  });
  const clearArtifacts = useCallback(() => {
    setArtifacts(/* @__PURE__ */ new Map());
    setPanelState((prev) => ({ ...prev, isOpen: false, activeArtifactId: void 0 }));
  }, []);
  const activeArtifact = useMemo(() => {
    if (!panelState.activeArtifactId) return void 0;
    return artifacts.get(panelState.activeArtifactId);
  }, [artifacts, panelState.activeArtifactId]);
  const openArtifact = useCallback((artifactId) => {
    setPanelState((prev) => ({
      ...prev,
      isOpen: true,
      activeArtifactId: artifactId
    }));
  }, []);
  const closePanel = useCallback(() => {
    setPanelState((prev) => ({ ...prev, isOpen: false }));
  }, []);
  const setActiveTab = useCallback((tab) => {
    setPanelState((prev) => ({ ...prev, activeTab: tab }));
  }, []);
  const registerArtifacts = useCallback((nextArtifacts) => {
    if (!nextArtifacts.length) return;
    setArtifacts((prev) => {
      let hasChanges = false;
      for (const art of nextArtifacts) {
        const existing = prev.get(art.artifactId);
        if (!existing || existing.content !== art.content || existing.title !== art.title) {
          hasChanges = true;
          break;
        }
      }
      if (!hasChanges) return prev;
      const map = new Map(prev);
      for (const artifact of nextArtifacts) {
        map.set(artifact.artifactId, artifact);
      }
      return map;
    });
  }, []);
  const markSaved = useCallback((artifactId, record) => {
    setArtifacts((prev) => {
      const map = new Map(prev);
      const current = map.get(artifactId);
      if (!current) return prev;
      map.set(artifactId, { ...current, savedRecord: record });
      return map;
    });
  }, []);
  return useMemo(
    () => ({
      artifacts,
      panelState,
      activeArtifact,
      openArtifact,
      closePanel,
      setActiveTab,
      registerArtifacts,
      markSaved,
      clearArtifacts
    }),
    [
      artifacts,
      panelState,
      activeArtifact,
      openArtifact,
      closePanel,
      setActiveTab,
      registerArtifacts,
      markSaved,
      clearArtifacts
    ]
  );
}

// src/headless/hooks/stream-event-utils.ts
function resolveEventType(transportEvent, parsed) {
  if (!transportEvent || transportEvent === "message") {
    if (typeof parsed.event === "string" && parsed.event.trim()) {
      return parsed.event;
    }
    if (typeof parsed.type === "string" && parsed.type.trim()) {
      return parsed.type;
    }
    const payloadEvent = parsed.payload?.event;
    if (typeof payloadEvent === "string" && payloadEvent.trim()) {
      return payloadEvent;
    }
    const payloadType = parsed.payload?.type;
    if (typeof payloadType === "string" && payloadType.trim()) {
      return payloadType;
    }
    return "message";
  }
  return transportEvent;
}
function extractContent(parsed) {
  if (typeof parsed.content === "string") {
    return parsed.content;
  }
  const payload = parsed.payload;
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const payloadText = payload.text;
  if (typeof payloadText === "string") {
    return payloadText;
  }
  const payloadContent = payload.content;
  if (typeof payloadContent === "string") {
    return payloadContent;
  }
  return "";
}
function extractError(parsed) {
  if (typeof parsed.error === "string" && parsed.error.trim()) {
    return parsed.error;
  }
  const payloadError = parsed.payload?.error;
  if (typeof payloadError === "string" && payloadError.trim()) {
    return payloadError;
  }
  const payloadMessage = parsed.payload?.message;
  if (typeof payloadMessage === "string" && payloadMessage.trim()) {
    return payloadMessage;
  }
  if (typeof parsed.message === "string" && parsed.message.trim()) {
    return parsed.message;
  }
  return void 0;
}
function isRunnerControlEvent(eventType) {
  switch (eventType) {
    case "thought":
    case "tool_call":
    case "tool_result":
    case "status":
    case "handoff":
    case "agent_step_started":
    case "delegation_return":
    case "tool_approval_request":
    case "tool_approval_resolved":
      return true;
    default:
      return false;
  }
}
function isRunnerCompletion(eventType, parsed) {
  if (eventType !== "status") return false;
  const state = parsed.payload?.state;
  return state === "completed";
}
function isRunnerCancellation(eventType, parsed) {
  if (eventType !== "status") return false;
  return parsed.payload?.state === "canceled";
}
var truncate = (value, max = 160) => value.length > max ? `${value.slice(0, max - 1)}\u2026` : value;
var asString = (value) => typeof value === "string" ? value : "";
function runnerEventToStep(eventType, parsed, stepSeq) {
  const payload = parsed.payload ?? {};
  switch (eventType) {
    case "thought":
      return {
        type: "reasoning",
        label: "Thinking\u2026",
        status: "in_progress",
        step_id: "runner_reasoning"
      };
    case "status": {
      const state = asString(payload["state"]);
      if (state === "completed" || state === "canceled") {
        return null;
      }
      if (state === "analyzing" || state === "acting") {
        return {
          type: "reasoning",
          label: asString(payload["status"]) || "Working\u2026",
          status: "in_progress",
          step_id: "runner_reasoning"
        };
      }
      const rawLabel = asString(parsed["label"]) || asString(payload["label"]) || asString(payload["status"]) || asString(parsed["status"]) || asString(parsed["message"]) || asString(payload["message"]);
      if (rawLabel && rawLabel !== "completed" && rawLabel !== "canceled") {
        const phase = asString(parsed["phase"]) || asString(payload["phase"]);
        const isDone = phase === "done" || phase === "completed";
        const explicitId = asString(parsed["step_id"]) || asString(payload["step_id"]) || asString(parsed["id"]) || asString(payload["id"]);
        const labelForId = rawLabel.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        const stepId = explicitId || `runner_status_${labelForId}`;
        const duration = typeof parsed["duration_ms"] === "number" ? parsed["duration_ms"] : typeof payload["duration_ms"] === "number" ? payload["duration_ms"] : void 0;
        return {
          type: "reasoning",
          label: rawLabel,
          status: isDone ? "done" : "in_progress",
          step_id: stepId,
          ...duration !== void 0 ? { duration_ms: duration } : {}
        };
      }
      return null;
    }
    case "tool_call": {
      const name = asString(payload["name"]) || "tool";
      if (name === "llm_chat") return null;
      return {
        type: "tool_call",
        label: `Using ${name}\u2026`,
        status: "in_progress",
        step_id: `runner_tool_call_${stepSeq}`
      };
    }
    case "tool_result": {
      const name = asString(payload["name"]) || "tool";
      const output = asString(payload["output"]);
      return {
        type: "tool_result",
        label: `${name} result`,
        ...output ? { detail: truncate(output) } : {},
        status: "done",
        step_id: `runner_tool_result_${stepSeq}`
      };
    }
    case "handoff": {
      const frame = parsed;
      const to = asString(frame["toAlias"]) || asString(frame["toSubAgentId"]) || "agent";
      const kind = asString(frame["type"]) || "transfer";
      return {
        type: "handoff",
        label: to,
        detail: kind,
        status: "in_progress",
        step_id: `runner_handoff_${stepSeq}`
      };
    }
    default:
      return null;
  }
}
function runnerStepConsumesSeq(eventType) {
  return eventType === "tool_call" || eventType === "tool_result" || eventType === "handoff";
}
function toolApprovalFromRequestEvent(parsed) {
  const payload = parsed.payload ?? parsed;
  const approvalId = asString(payload["approvalId"]);
  const toolCallId = asString(payload["toolCallId"]);
  if (!approvalId || !toolCallId) return null;
  const riskCategory = asString(payload["riskCategory"]);
  const expiresAt = asString(payload["expiresAt"]);
  const executionId = asString(payload["executionId"]);
  return {
    approvalId,
    toolCallId,
    toolName: asString(payload["toolName"]) || "tool",
    ...payload["args"] !== void 0 ? { args: payload["args"] } : {},
    ...riskCategory ? { riskCategory } : {},
    ...expiresAt ? { expiresAt } : {},
    ...executionId ? { executionId } : {},
    status: "pending"
  };
}
var RESOLVED_APPROVAL_STATUSES = [
  "approved",
  "denied",
  "expired",
  "canceled"
];
function toolApprovalResolutionFromEvent(parsed) {
  const payload = parsed.payload ?? parsed;
  const approvalId = asString(payload["approvalId"]);
  if (!approvalId) return null;
  const decision = asString(payload["decision"]);
  const reason = asString(payload["reason"]);
  return {
    approvalId,
    status: decision === "timeout" ? "expired" : RESOLVED_APPROVAL_STATUSES.includes(decision) ? decision : "canceled",
    reason: reason || null
  };
}

// src/headless/utils/artifact-utils.ts
var ARTIFACT_TAG_RE = /<artifact\b([^>]*)>([\s\S]*?)<\/artifact>/g;
function extractAttr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]+)"`));
  return m?.[1] ?? "";
}
function extractArtifactsFromContent(content, idPrefix) {
  const artifacts = [];
  ARTIFACT_TAG_RE.lastIndex = 0;
  let index = 0;
  const cleanedContent = content.replace(ARTIFACT_TAG_RE, (_full, attrs, body) => {
    const type = extractAttr(attrs, "type") || "markdown";
    const title = extractAttr(attrs, "title") || "Document";
    const artifactId = idPrefix ? `${idPrefix}-art-${index++}` : `frontend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    artifacts.push({
      artifactId,
      type,
      title,
      content: body.trim(),
      exportFormats: ["markdown"]
    });
    return "";
  });
  return { cleanedContent: cleanedContent.trim(), artifacts };
}

// src/headless/utils/citation-utils.ts
var CITE_TAG_RE = /<cite\s+source_id="([^"]+)">([\s\S]*?)<\/cite>/g;
var MAX_CITATIONS = 10;
function extractCitationsFromContent(content, sources) {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const citationOrder = [];
  const seenIds = /* @__PURE__ */ new Set();
  CITE_TAG_RE.lastIndex = 0;
  const cleanedContent = content.replace(CITE_TAG_RE, (_full, rawIds, text) => {
    const idList = rawIds.split(",").map((id) => id.trim()).filter(Boolean);
    for (const id of idList) {
      if (!seenIds.has(id) && sourceMap.has(id) && citationOrder.length < MAX_CITATIONS) {
        seenIds.add(id);
        citationOrder.push(id);
      }
    }
    const markers = idList.filter((id) => seenIds.has(id)).map((id) => `[${citationOrder.indexOf(id) + 1}]`).join("");
    const cleanText = text.trim();
    return markers ? `${cleanText}${markers}` : cleanText;
  });
  const citations = citationOrder.map((id) => sourceMap.get(id));
  return { cleanedContent: cleanedContent.trim(), citations };
}

// src/headless/utils/suggestion-utils.ts
var SUGGESTIONS_TAG_RE = /<suggestions>([\s\S]*?)<\/suggestions>/g;
function extractSuggestionsFromContent(content) {
  const suggestions = [];
  SUGGESTIONS_TAG_RE.lastIndex = 0;
  const cleanedContent = content.replace(SUGGESTIONS_TAG_RE, (_full, inner) => {
    try {
      const parsed = JSON.parse(inner.trim());
      for (const item of parsed) {
        if (typeof item === "string") suggestions.push(item);
      }
    } catch {
    }
    return "";
  });
  return { cleanedContent: cleanedContent.trim(), suggestions };
}

// src/headless/utils/streaming-source-stripper.ts
var CITATION_BLOCK_RE = /(?:\[(?:source|cite):[\s\S]*?\]|【[\s\S]*?】)/gi;
var INCOMPLETE_TRAILING_SOURCE_RE = /(?:\r?\n)*(?:\[(?:s(?:o(?:u(?:r(?:c(?:e)?)?)?)?)?|c(?:i(?:t(?:e)?)?)?)?(?::[^\n\]]*)?|【[^】\n]*)$/i;
function parseSources(content) {
  if (!content) return [];
  const results = [];
  const seenKeys = /* @__PURE__ */ new Set();
  let index = 0;
  for (const m of content.matchAll(CITATION_BLOCK_RE)) {
    const block = m[0];
    if (block.startsWith("[")) {
      const nameMatch = /\[(?:source|cite):\s*([^,\]]+)/i.exec(block);
      const name = nameMatch?.[1]?.trim();
      if (!name || name.toLowerCase() === "basecamp") continue;
      const tags = /,\s*tags:\s*([^,\]]+)/i.exec(block)?.[1]?.trim();
      const classification = /,\s*classification:\s*([^,\]"]+?)(?:,|\])/i.exec(block)?.[1]?.trim();
      const citation = /,\s*citation:\s*"([\s\S]*?)"/i.exec(block)?.[1]?.trim() ?? /,\s*citation:\s*([^,\]]+)/i.exec(block)?.[1]?.trim();
      const pageMatch = /,\s*page:\s*(\d+)/i.exec(block);
      const page = pageMatch && pageMatch[1] ? parseInt(pageMatch[1], 10) : void 0;
      const sectionRaw = /,\s*section:\s*([^,\]]+)/i.exec(block)?.[1]?.trim();
      const section = sectionRaw ? sectionRaw.replace(/^["'\s]+|["'\s]+$/g, "") : void 0;
      const dedupeKey = (name + (citation || "")).toLowerCase();
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);
      index += 1;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      results.push({
        id: `src_${index}_${slug}`,
        title: name,
        snippet: citation,
        page,
        section,
        metadata: {
          ...tags ? { tags } : {},
          ...classification ? { classification } : {},
          ...citation ? { citation } : {},
          ...page !== void 0 ? { page } : {},
          ...section ? { section } : {}
        },
        type: "document"
      });
    } else if (block.startsWith("\u3010")) {
      const inner = block.slice(1, -1).trim();
      if (!inner) continue;
      if (/^(?:source|cite):/i.test(inner)) {
        const nameMatch = /(?:source|cite):\s*([^,】]+)/i.exec(inner);
        const name = nameMatch?.[1]?.trim();
        if (!name || name.toLowerCase() === "basecamp") continue;
        const tags = /,\s*tags:\s*([^,】]+)/i.exec(inner)?.[1]?.trim();
        const classification = /,\s*classification:\s*([^,】"]+?)(?:,|】)/i.exec(inner)?.[1]?.trim();
        const citation = /,\s*citation:\s*"([\s\S]*?)"/i.exec(inner)?.[1]?.trim() ?? /,\s*citation:\s*([^,】]+)/i.exec(inner)?.[1]?.trim();
        const dedupeKey = (name + (citation || "")).toLowerCase();
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);
        index += 1;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        results.push({
          id: `src_${index}_${slug}`,
          title: name,
          snippet: citation,
          metadata: {
            ...tags ? { tags } : {},
            ...classification ? { classification } : {},
            ...citation ? { citation } : {}
          },
          type: "document"
        });
      } else {
        const match = /^(?:(\d+(?::\d+)?)\s*†\s*)?([\s\S]*)$/.exec(inner);
        const sourceNum = match?.[1]?.trim();
        const titlePart = match?.[2]?.trim();
        let title;
        if (!titlePart && sourceNum) {
          title = `Source ${sourceNum}`;
        } else if (titlePart && titlePart.toLowerCase() === "source") {
          title = sourceNum ? `Source ${sourceNum}` : "Source";
        } else if (titlePart) {
          title = titlePart;
        } else {
          title = `Source ${index + 1}`;
        }
        if (title.toLowerCase() === "basecamp") continue;
        const dedupeKey = title.toLowerCase();
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);
        index += 1;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        results.push({
          id: `src_${index}_${slug}`,
          title,
          metadata: {
            ...sourceNum ? { citationIndex: sourceNum } : {}
          },
          type: "document"
        });
      }
    }
  }
  return results;
}
function stripSources(content) {
  if (!content) return "";
  return content.replace(CITATION_BLOCK_RE, "").replace(INCOMPLETE_TRAILING_SOURCE_RE, "").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+([.,;:!?])/g, "$1").replace(/\n{3,}/g, "\n\n").trim();
}
var StreamingSourceStripper = class {
  buffer = "";
  inBracketSource = false;
  inFullwidthSource = false;
  currentSourceContent = "";
  collectedSourceBlocks = [];
  /**
   * Process an incoming stream delta chunk.
   * Returns only safe, visible content with citation blocks and partial citation syntax stripped.
   */
  process(delta) {
    this.buffer += delta;
    let output = "";
    while (this.buffer.length > 0) {
      if (this.inFullwidthSource) {
        const closeIdx = this.buffer.indexOf("\u3011");
        if (closeIdx !== -1) {
          this.currentSourceContent += this.buffer.slice(0, closeIdx + 1);
          this.collectedSourceBlocks.push(this.currentSourceContent);
          this.buffer = this.buffer.slice(closeIdx + 1);
          this.inFullwidthSource = false;
          this.currentSourceContent = "";
        } else {
          this.currentSourceContent += this.buffer;
          this.buffer = "";
        }
      } else if (this.inBracketSource) {
        const closeIdx = this.buffer.indexOf("]");
        if (closeIdx !== -1) {
          this.currentSourceContent += this.buffer.slice(0, closeIdx + 1);
          this.collectedSourceBlocks.push(this.currentSourceContent);
          this.buffer = this.buffer.slice(closeIdx + 1);
          this.inBracketSource = false;
          this.currentSourceContent = "";
        } else {
          this.currentSourceContent += this.buffer;
          this.buffer = "";
        }
      } else {
        const fullwidthIdx = this.buffer.indexOf("\u3010");
        const bracketIdx = this.buffer.indexOf("[");
        if (fullwidthIdx === -1 && bracketIdx === -1) {
          output += this.buffer;
          this.buffer = "";
          break;
        }
        if (fullwidthIdx !== -1 && (bracketIdx === -1 || fullwidthIdx < bracketIdx)) {
          const nlMatch = this.buffer.slice(0, fullwidthIdx).match(/(?:\r?\n)+$/);
          const cutPoint = nlMatch ? fullwidthIdx - nlMatch[0].length : fullwidthIdx;
          output += this.buffer.slice(0, cutPoint);
          this.buffer = this.buffer.slice(fullwidthIdx + 1);
          this.inFullwidthSource = true;
          this.currentSourceContent = "\u3010";
          continue;
        }
        if (bracketIdx !== -1) {
          const after = this.buffer.slice(bracketIdx + 1);
          const lowerAfter = after.toLowerCase();
          if (lowerAfter.startsWith("source:")) {
            const nlMatch = this.buffer.slice(0, bracketIdx).match(/(?:\r?\n)+$/);
            const cutPoint = nlMatch ? bracketIdx - nlMatch[0].length : bracketIdx;
            output += this.buffer.slice(0, cutPoint);
            this.buffer = this.buffer.slice(bracketIdx + 1 + 7);
            this.inBracketSource = true;
            this.currentSourceContent = "[source:";
            continue;
          }
          if (lowerAfter.startsWith("cite:")) {
            const nlMatch = this.buffer.slice(0, bracketIdx).match(/(?:\r?\n)+$/);
            const cutPoint = nlMatch ? bracketIdx - nlMatch[0].length : bracketIdx;
            output += this.buffer.slice(0, cutPoint);
            this.buffer = this.buffer.slice(bracketIdx + 1 + 5);
            this.inBracketSource = true;
            this.currentSourceContent = "[cite:";
            continue;
          }
          const isPrefixOfSource = "source:".startsWith(lowerAfter);
          const isPrefixOfCite = "cite:".startsWith(lowerAfter);
          if (isPrefixOfSource || isPrefixOfCite) {
            const nlMatch = this.buffer.slice(0, bracketIdx).match(/(?:\r?\n)+$/);
            const cutPoint = nlMatch ? bracketIdx - nlMatch[0].length : bracketIdx;
            output += this.buffer.slice(0, cutPoint);
            this.buffer = this.buffer.slice(cutPoint);
            break;
          }
          output += this.buffer.slice(0, bracketIdx + 1);
          this.buffer = this.buffer.slice(bracketIdx + 1);
        }
      }
    }
    return output;
  }
  /**
   * Flushes any remaining buffer at the end of the stream.
   * Ensures unfinished/partial citation tags are suppressed from output and collected.
   */
  flush() {
    if (this.inFullwidthSource) {
      if (this.currentSourceContent || this.buffer) {
        const raw = `${this.currentSourceContent}${this.buffer}${this.buffer.endsWith("\u3011") ? "" : "\u3011"}`;
        this.collectedSourceBlocks.push(raw);
      }
      this.buffer = "";
      this.inFullwidthSource = false;
      this.currentSourceContent = "";
      return "";
    }
    if (this.inBracketSource) {
      if (this.currentSourceContent || this.buffer) {
        const raw = `${this.currentSourceContent}${this.buffer}${this.buffer.endsWith("]") ? "" : "]"}`;
        this.collectedSourceBlocks.push(raw);
      }
      this.buffer = "";
      this.inBracketSource = false;
      this.currentSourceContent = "";
      return "";
    }
    if (this.buffer) {
      const trimmed = this.buffer.trim();
      const lowerTrimmed = trimmed.toLowerCase();
      if (lowerTrimmed.startsWith("[source:") || lowerTrimmed.startsWith("[cite:") || trimmed.startsWith("\u3010")) {
        const isBracket = lowerTrimmed.startsWith("[");
        const closing = isBracket ? "]" : "\u3011";
        this.collectedSourceBlocks.push(`${trimmed}${closing}`);
        this.buffer = "";
        return "";
      }
      if (lowerTrimmed.startsWith("[s") || lowerTrimmed.startsWith("[c") || lowerTrimmed === "[" || trimmed === "\u3010") {
        this.buffer = "";
        return "";
      }
      const remaining = this.buffer;
      this.buffer = "";
      return remaining;
    }
    return "";
  }
  /**
   * Returns structured MessageSource objects parsed from all collected citation blocks.
   */
  getCollectedSources() {
    const raw = this.collectedSourceBlocks.join("\n");
    return parseSources(raw);
  }
};

// src/headless/hooks/use-chat.ts
function generateMessageId() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `msg_${ts}_${rand}`;
}
function createUserMessage(content) {
  return {
    id: generateMessageId(),
    content,
    role: "user",
    timestamp: /* @__PURE__ */ new Date()
  };
}
function createAssistantMessage() {
  return {
    id: generateMessageId(),
    content: "",
    role: "assistant",
    timestamp: /* @__PURE__ */ new Date(),
    isStreaming: true,
    steps: [],
    startedAt: Date.now()
  };
}
var ChatStateContext = createContext(null);
function useProvideChat(onArtifactsReady, onClearArtifacts) {
  const {
    adapter,
    organizationId,
    currentSession,
    setCurrentSession,
    activeContextId,
    setActiveContext,
    persistentContextVariables,
    onSlashCommand,
    contextReferences
  } = useChatContext();
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [streamingState, setStreamingState] = useState({
    isStreaming: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [resumeState, setResumeState] = useState(null);
  const resumableExecutionIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeExecutionIdRef = useRef(null);
  const lastUserMessageRef = useRef("");
  const onArtifactsReadyRef = useRef(onArtifactsReady);
  onArtifactsReadyRef.current = onArtifactsReady;
  const onClearArtifactsRef = useRef(onClearArtifacts);
  onClearArtifactsRef.current = onClearArtifacts;
  const accumContentRef = useRef("");
  const accumProcessedContentRef = useRef("");
  const streamingSourceStripperRef = useRef(null);
  const stepSeqRef = useRef(0);
  const activeContextIdRef = useRef(activeContextId);
  activeContextIdRef.current = activeContextId;
  const persistentContextVariablesRef = useRef(persistentContextVariables);
  persistentContextVariablesRef.current = persistentContextVariables;
  const onSlashCommandRef = useRef(onSlashCommand);
  onSlashCommandRef.current = onSlashCommand;
  const contextReferencesRef = useRef(contextReferences);
  contextReferencesRef.current = contextReferences;
  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    activeExecutionIdRef.current = null;
    streamingSourceStripperRef.current = null;
    accumProcessedContentRef.current = "";
    setMessages([]);
    setStreamingState({ isStreaming: false });
    setIsLoading(false);
    setCurrentSession(void 0);
    setActiveContext(void 0);
    onClearArtifactsRef.current?.();
  }, [setCurrentSession, setActiveContext]);
  const consumeStream = useCallback(
    async (reader, assistantMessageId, signal) => {
      const MAX_RECONNECTS = 5;
      let currentReader = reader;
      let reconnectAttempt = 0;
      accumContentRef.current = "";
      accumProcessedContentRef.current = "";
      streamingSourceStripperRef.current = new StreamingSourceStripper();
      const settleStopped = (stopped = false) => {
        setMessages(
          (prev) => prev.map(
            (msg) => msg.id === assistantMessageId && msg.isStreaming ? {
              ...msg,
              isStreaming: false,
              ...stopped ? { stoppedByUser: true } : {},
              elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
            } : msg
          )
        );
        setStreamingState({ isStreaming: false });
        setIsLoading(false);
      };
      const settleDropped = () => {
        setMessages(
          (prev) => prev.map(
            (msg) => msg.id === assistantMessageId && msg.isStreaming ? {
              ...msg,
              isStreaming: false,
              error: msg.error ?? "The connection was lost before the response finished. Retry to continue.",
              elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
            } : msg
          )
        );
        setStreamingState({ isStreaming: false });
        setIsLoading(false);
      };
      for (; ; ) {
        const decoder = new TextDecoder();
        let sawTerminal = false;
        let sawCancellation = false;
        const parser = createParser({
          onEvent(event) {
            if (event.data === "[DONE]") {
              sawTerminal = true;
              let finalSources;
              if (streamingSourceStripperRef.current) {
                const flushed = streamingSourceStripperRef.current.flush();
                accumProcessedContentRef.current += flushed;
                const collected = streamingSourceStripperRef.current.getCollectedSources();
                if (collected.length > 0) {
                  finalSources = collected;
                }
              }
              setMessages(
                (prev) => prev.map(
                  (msg) => msg.id === assistantMessageId ? {
                    ...msg,
                    isStreaming: false,
                    content: stripSources(accumProcessedContentRef.current || msg.content),
                    sources: finalSources ?? msg.sources,
                    steps: msg.steps?.map(
                      (s) => s.status === "in_progress" ? { ...s, status: "done" } : s
                    ),
                    elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
                  } : msg
                )
              );
              setStreamingState({ isStreaming: false });
              setIsLoading(false);
              return;
            }
            let parsed;
            try {
              parsed = JSON.parse(event.data);
            } catch {
              return;
            }
            const outerEventType = resolveEventType(event.event, parsed);
            if (outerEventType === "started") {
              const startedExecutionId = parsed["executionId"];
              if (typeof startedExecutionId === "string" && startedExecutionId) {
                activeExecutionIdRef.current = startedExecutionId;
                setStreamingState(
                  (prev) => prev.isStreaming ? { ...prev, executionId: startedExecutionId } : prev
                );
                setMessages(
                  (prev) => prev.map(
                    (msg) => msg.id === assistantMessageId ? { ...msg, executionId: startedExecutionId } : msg
                  )
                );
              }
            }
            const isRunnerControl = isRunnerControlEvent(outerEventType);
            const isCompletionSignal = outerEventType === "done" || parsed.isComplete === true || parsed.type === "complete" || isRunnerCompletion(outerEventType, parsed);
            const isCancellationSignal = isRunnerCancellation(outerEventType, parsed);
            let runnerStep = null;
            if (isRunnerControl) {
              runnerStep = runnerEventToStep(outerEventType, parsed, stepSeqRef.current);
              if (runnerStep && runnerStepConsumesSeq(outerEventType)) {
                stepSeqRef.current += 1;
              }
            }
            if (outerEventType === "artifact" && parsed.payload) {
              onArtifactsReadyRef.current?.([parsed.payload]);
            }
            if (outerEventType === "context_resolved" && parsed.payload) {
              const { key, value } = parsed.payload;
              if ((key === "contextId" || key === "frameworkId") && typeof value === "string") {
                setActiveContext(value);
              }
            }
            const rawParsedContent = extractContent(parsed);
            if (rawParsedContent && outerEventType !== "artifact" && !isRunnerControl) {
              accumContentRef.current += rawParsedContent;
              const strippedChunk = streamingSourceStripperRef.current ? streamingSourceStripperRef.current.process(rawParsedContent) : rawParsedContent;
              accumProcessedContentRef.current += strippedChunk;
            }
            let frontendArtifacts = [];
            const originalAccumContent = accumContentRef.current;
            let cleanedAccumContent = originalAccumContent;
            let frontendCitations = [];
            let frontendRecords = [];
            let frontendSuggestions = [];
            if (isCompletionSignal) {
              const extracted = extractArtifactsFromContent(
                originalAccumContent,
                assistantMessageId
              );
              if (extracted.artifacts.length > 0) {
                frontendArtifacts = extracted.artifacts;
                cleanedAccumContent = extracted.cleanedContent;
                onArtifactsReadyRef.current?.(frontendArtifacts);
              }
              const doneSources = Array.isArray(parsed.sources) ? parsed.sources : Array.isArray(parsed.payload?.sources) ? parsed.payload.sources : [];
              const citationResult = extractCitationsFromContent(cleanedAccumContent, doneSources);
              cleanedAccumContent = citationResult.cleanedContent;
              frontendCitations = citationResult.citations;
              const recordResult = extractRecordTagsFromContent(cleanedAccumContent);
              cleanedAccumContent = recordResult.cleanedContent;
              frontendRecords = recordResult.records;
              const suggestionsResult = extractSuggestionsFromContent(cleanedAccumContent);
              cleanedAccumContent = suggestionsResult.cleanedContent;
              frontendSuggestions = suggestionsResult.suggestions;
              if (streamingSourceStripperRef.current) {
                const flushed = streamingSourceStripperRef.current.flush();
                accumProcessedContentRef.current += flushed;
                const collectedSources = streamingSourceStripperRef.current.getCollectedSources();
                if (collectedSources.length > 0) {
                  frontendCitations = [...frontendCitations, ...collectedSources];
                }
              }
              cleanedAccumContent = stripSources(cleanedAccumContent);
            } else {
              cleanedAccumContent = accumProcessedContentRef.current || accumContentRef.current;
              if (cleanedAccumContent.includes("<record")) {
                const { cleanedContent } = extractRecordTagsFromContent(cleanedAccumContent);
                cleanedAccumContent = cleanedContent;
              }
            }
            setMessages(
              (prev) => prev.map((msg) => {
                if (msg.id !== assistantMessageId) return msg;
                const eventType2 = resolveEventType(event.event, parsed);
                const parsedError = extractError(parsed);
                const parsedContent = extractContent(parsed);
                const payload = parsed.payload;
                const payloadSources = Array.isArray(payload?.sources) ? payload.sources : void 0;
                const payloadArtifactIds = Array.isArray(payload?.artifactIds) ? payload.artifactIds : void 0;
                const isComplete = isCompletionSignal;
                if (eventType2 === "artifact" && payload) {
                  const artifact = payload;
                  return {
                    ...msg,
                    artifactIds: [...msg.artifactIds ?? [], artifact.artifactId]
                  };
                }
                if (eventType2 === "step") {
                  const rawStep = parsed.step || parsed.payload?.step || (parsed.payload && typeof parsed.payload === "object" && ("label" in parsed.payload || "step_id" in parsed.payload) ? parsed.payload : void 0) || (parsed.label ? parsed : void 0);
                  if (rawStep && (rawStep.label || rawStep.step_id)) {
                    const stepId = rawStep.step_id || (rawStep.label ? `step_${rawStep.label.toLowerCase().replace(/[^a-z0-9_]/g, "_")}` : `step_${stepSeqRef.current}`);
                    const normalizedStep = {
                      type: rawStep.type ?? "reasoning",
                      label: rawStep.label ?? "Step",
                      status: rawStep.status ?? "in_progress",
                      step_id: stepId,
                      ...rawStep.duration_ms !== void 0 ? { duration_ms: rawStep.duration_ms } : {},
                      ...rawStep.detail !== void 0 ? { detail: rawStep.detail } : {}
                    };
                    const existing = msg.steps ?? [];
                    const idx = existing.findIndex((s) => s.step_id === normalizedStep.step_id);
                    const updatedExisting = normalizedStep.status === "in_progress" && idx < 0 ? existing.map(
                      (s) => s.status === "in_progress" && (s.type === "reasoning" || s.type === "tool_call") ? { ...s, status: "done" } : s
                    ) : existing;
                    const nextSteps = idx >= 0 ? updatedExisting.map(
                      (s, i) => i === idx ? { ...s, ...normalizedStep } : s
                    ) : [...updatedExisting, normalizedStep];
                    return { ...msg, steps: nextSteps };
                  }
                }
                if (runnerStep) {
                  const step = runnerStep;
                  const existing = msg.steps ?? [];
                  const idx = existing.findIndex((s) => s.step_id === step.step_id);
                  const updatedExisting = step.status === "in_progress" && idx < 0 ? existing.map(
                    (s) => s.status === "in_progress" && (s.type === "reasoning" || s.type === "tool_call") ? { ...s, status: "done" } : s
                  ) : existing;
                  const nextSteps = idx >= 0 ? updatedExisting.map((s, i) => i === idx ? { ...s, ...step } : s) : [...updatedExisting, step];
                  return { ...msg, steps: nextSteps };
                }
                if (eventType2 === "plan" && parsed.plan) {
                  return { ...msg, plan: parsed.plan.phases };
                }
                if (eventType2 === "context_required" && parsed.contextKey && parsed.choices) {
                  return {
                    ...msg,
                    contextRequired: {
                      contextKey: parsed.contextKey,
                      questionIntro: parsed.questionIntro ?? "",
                      choices: parsed.choices
                    }
                  };
                }
                if (eventType2 === "tool_approval_request") {
                  const approval = toolApprovalFromRequestEvent(parsed);
                  if (!approval) return msg;
                  const existing = msg.toolApprovals ?? [];
                  const idx = existing.findIndex((a) => a.approvalId === approval.approvalId);
                  const nextApprovals = idx >= 0 ? existing.map((a, i) => i === idx ? { ...a, ...approval } : a) : [...existing, approval];
                  return { ...msg, toolApprovals: nextApprovals };
                }
                if (eventType2 === "tool_approval_resolved") {
                  const resolution = toolApprovalResolutionFromEvent(parsed);
                  if (!resolution || !msg.toolApprovals?.length) return msg;
                  return {
                    ...msg,
                    toolApprovals: msg.toolApprovals.map(
                      (a) => a.approvalId === resolution.approvalId ? {
                        ...a,
                        status: resolution.status,
                        reason: resolution.reason ?? a.reason ?? null,
                        error: void 0
                      } : a
                    )
                  };
                }
                if (isComplete) {
                  const backendArtifactIds = parsed.artifactIds ?? payloadArtifactIds ?? msg.artifactIds;
                  const allArtifactIds = [
                    ...backendArtifactIds ?? [],
                    ...frontendArtifacts.map((a) => a.artifactId)
                  ];
                  const contentWasModified = cleanedAccumContent !== originalAccumContent;
                  const hasClientSideChanges = frontendArtifacts.length > 0 || frontendCitations.length > 0 || frontendRecords.length > 0 || contentWasModified;
                  const doneSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(
                    (s) => typeof s === "string"
                  ) : [];
                  const finalSuggestions = doneSuggestions.length > 0 ? doneSuggestions : frontendSuggestions;
                  const finalizedSteps = msg.steps?.map(
                    (s) => s.status === "in_progress" ? { ...s, status: "done" } : s
                  );
                  return {
                    ...msg,
                    content: hasClientSideChanges ? cleanedAccumContent : msg.content,
                    isStreaming: false,
                    artifactIds: allArtifactIds.length > 0 ? allArtifactIds : msg.artifactIds,
                    sources: frontendCitations.length > 0 ? frontendCitations : parsed.sources ?? payloadSources ?? msg.sources,
                    records: frontendRecords.length > 0 ? frontendRecords : msg.records,
                    suggestions: finalSuggestions.length > 0 ? finalSuggestions : msg.suggestions,
                    steps: finalizedSteps ?? msg.steps,
                    elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
                  };
                }
                if (eventType2 === "error" || parsedError) {
                  return {
                    ...msg,
                    isStreaming: false,
                    error: parsedError ?? "Unexpected stream error",
                    elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
                  };
                }
                const nextContent = cleanedAccumContent || (parsedContent ? `${msg.content}${parsedContent}` : msg.content);
                return {
                  ...msg,
                  content: nextContent,
                  sources: parsed.sources ?? payloadSources ?? msg.sources,
                  isStreaming: !isComplete,
                  elapsedMs: isComplete && msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
                };
              })
            );
            const eventType = resolveEventType(event.event, parsed);
            if (isCompletionSignal || isCancellationSignal || eventType === "error") {
              sawTerminal = true;
              sawCancellation = sawCancellation || isCancellationSignal;
              setStreamingState({ isStreaming: false });
              setIsLoading(false);
            }
          },
          onError() {
            setStreamingState({
              isStreaming: false,
              error: "Failed to parse stream event"
            });
            setIsLoading(false);
          }
        });
        try {
          while (true) {
            if (signal.aborted) break;
            const { done, value } = await currentReader.read();
            if (done) break;
            parser.feed(decoder.decode(value, { stream: true }));
          }
        } catch (error) {
          if (signal.aborted || error instanceof Error && error.name === "AbortError") {
            settleStopped();
            return;
          }
        }
        const tail = decoder.decode();
        if (tail) {
          parser.feed(tail);
        }
        try {
          currentReader.releaseLock();
        } catch {
        }
        if (sawTerminal || signal.aborted) {
          settleStopped(sawCancellation);
          return;
        }
        const executionId = activeExecutionIdRef.current;
        const reconnect = adapter.getExecutionStream?.bind(adapter);
        if (!executionId || !reconnect || reconnectAttempt >= MAX_RECONNECTS) {
          settleDropped();
          return;
        }
        reconnectAttempt += 1;
        let replayStream;
        try {
          replayStream = await reconnect(executionId, 0, { signal });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          settleDropped();
          return;
        }
        accumContentRef.current = "";
        accumProcessedContentRef.current = "";
        streamingSourceStripperRef.current = new StreamingSourceStripper();
        stepSeqRef.current = 0;
        setMessages(
          (prev) => prev.map(
            (msg) => msg.id === assistantMessageId ? { ...msg, content: "", steps: [], artifactIds: [], isStreaming: true } : msg
          )
        );
        currentReader = replayStream.getReader();
      }
    },
    [setMessages, setStreamingState, setIsLoading, setActiveContext, adapter]
  );
  const sendMessage = useCallback(
    async (message, attachedFileIds, overrideSessionId, extraContextVariables) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const slashMatch = trimmed.match(/^(\/\w+)\s*([\s\S]*)$/);
      const commandName = slashMatch?.[1];
      const commandArgs = (slashMatch?.[2] ?? "").trim();
      const matchedCommand = commandName ? getSlashCommandRegistry().find((c) => c.name === commandName) : void 0;
      if (commandName) {
        const appendedMessages = [];
        const slashCtx = {
          appendAssistantMessage: (markdown) => {
            appendedMessages.push(markdown);
          }
        };
        let handled = false;
        if (onSlashCommandRef.current) {
          handled = await onSlashCommandRef.current(commandName, commandArgs, slashCtx) === true;
        }
        if (!handled && matchedCommand?.slashCommandId === "help") {
          const commands = getSlashCommandRegistry();
          const helpContent = `### Available Commands

| Command | Description | Example |
| :--- | :--- | :--- |
${commands.map((c) => `| **${c.name}** | ${c.description} | \`${c.exampleUsage || ""}\` |`).join("\n")}

Type \`/\` in the chat box to see the command menu.`;
          appendedMessages.push(helpContent);
          handled = true;
        }
        if (handled) {
          const commandMessage = {
            id: generateMessageId(),
            content: trimmed,
            role: "command",
            timestamp: /* @__PURE__ */ new Date()
          };
          const assistantMessages = appendedMessages.map((content) => ({
            ...createAssistantMessage(),
            content,
            isStreaming: false
          }));
          setMessages((prev) => [...prev, commandMessage, ...assistantMessages]);
          return;
        }
      }
      let sessionId = overrideSessionId ?? currentSession?.sessionId;
      if (!sessionId) {
        sessionId = await adapter.createSession({
          organizationId,
          contextId: activeContextIdRef.current
        });
      }
      if (!currentSession?.sessionId) {
        setCurrentSession({
          sessionId,
          title: "New conversation",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "active",
          contextId: activeContextIdRef.current
        });
      }
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      activeExecutionIdRef.current = null;
      const userMessage = createUserMessage(trimmed);
      const assistantMessage = createAssistantMessage();
      accumContentRef.current = "";
      stepSeqRef.current = 0;
      lastUserMessageRef.current = trimmed;
      resumableExecutionIdRef.current = null;
      setResumeState(null);
      const messagesToInsert = matchedCommand ? [
        {
          id: generateMessageId(),
          content: matchedCommand.name,
          role: "command",
          timestamp: /* @__PURE__ */ new Date()
        },
        assistantMessage
      ] : [userMessage, assistantMessage];
      setMessages((prev) => [...prev, ...messagesToInsert]);
      setStreamingState({
        isStreaming: true,
        currentMessageId: assistantMessage.id
      });
      setIsLoading(true);
      try {
        const finalMessage = matchedCommand && trimmed === matchedCommand.name ? `Execute ${matchedCommand.name}` : trimmed;
        const stream = await adapter.sendMessage(
          {
            organizationId,
            sessionId,
            message: finalMessage,
            ...attachedFileIds?.length ? { attachedFileIds } : {},
            contextVariables: {
              ...persistentContextVariablesRef.current,
              ...activeContextIdRef.current ? { contextId: activeContextIdRef.current } : {},
              ...matchedCommand ? { slashCommand: matchedCommand.slashCommandId } : {},
              ...contextReferencesRef.current.length > 0 ? { pageContext: JSON.stringify(contextReferencesRef.current) } : {},
              ...extraContextVariables
            }
          },
          { signal: controller.signal }
        );
        const reader = stream.getReader();
        await consumeStream(reader, assistantMessage.id, controller.signal);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setStreamingState({ isStreaming: false });
          setIsLoading(false);
          return;
        }
        setMessages(
          (prev) => prev.map(
            (msg) => msg.id === assistantMessage.id ? {
              ...msg,
              isStreaming: false,
              error: error instanceof Error ? error.message : "Unexpected error"
            } : msg
          )
        );
        setStreamingState({
          isStreaming: false,
          error: error instanceof Error ? error.message : "Unexpected error"
        });
        setIsLoading(false);
      } finally {
        abortControllerRef.current = null;
        activeExecutionIdRef.current = null;
      }
    },
    [adapter, currentSession?.sessionId, organizationId, setCurrentSession, consumeStream]
  );
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.error) {
        const withoutAssistant = prev.slice(0, -1);
        const secondToLast = withoutAssistant[withoutAssistant.length - 1];
        if (secondToLast?.role === "user") {
          return withoutAssistant.slice(0, -1);
        }
        return withoutAssistant;
      }
      return prev;
    });
    await sendMessage(lastUserMessageRef.current);
  }, [sendMessage]);
  const retryMessage = useCallback(
    async (messageId) => {
      const current = messagesRef.current;
      const target = current.find((m) => m.id === messageId && m.role === "user");
      const targetContent = target?.content;
      if (!targetContent) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        return idx < 0 ? prev : prev.slice(0, idx);
      });
      lastUserMessageRef.current = targetContent;
      await sendMessage(targetContent);
    },
    [sendMessage]
  );
  const resumeRun = useCallback(async () => {
    const executionId = resumableExecutionIdRef.current;
    const resume = adapter.resumeExecution?.bind(adapter);
    if (!executionId || !resume) {
      await retryLastMessage();
      return;
    }
    setResumeState(null);
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return last?.role === "assistant" && last.error ? prev.slice(0, -1) : prev;
    });
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    activeExecutionIdRef.current = executionId;
    const assistantMessage = createAssistantMessage();
    setMessages((prev) => [...prev, assistantMessage]);
    setStreamingState({ isStreaming: true, currentMessageId: assistantMessage.id, executionId });
    setIsLoading(true);
    let stream;
    try {
      stream = await resume(executionId, { signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      resumableExecutionIdRef.current = null;
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id));
      setStreamingState({ isStreaming: false });
      setIsLoading(false);
      await retryLastMessage();
      return;
    }
    try {
      await consumeStream(stream.getReader(), assistantMessage.id, controller.signal);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessages(
        (prev) => prev.map(
          (msg) => msg.id === assistantMessage.id ? {
            ...msg,
            isStreaming: false,
            error: error instanceof Error ? error.message : "Unexpected error"
          } : msg
        )
      );
      setStreamingState({ isStreaming: false });
      setIsLoading(false);
    }
  }, [adapter, consumeStream, retryLastMessage]);
  const stopStreaming = useCallback(() => {
    if (!abortControllerRef.current) return;
    const executionId = activeExecutionIdRef.current;
    const sessionId = currentSession?.sessionId;
    if (adapter.cancelRun && executionId && sessionId) {
      void adapter.cancelRun({ sessionId, executionId }).catch(() => {
      });
    }
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
    activeExecutionIdRef.current = null;
    setMessages(
      (prev) => prev.map(
        (msg) => msg.isStreaming ? {
          ...msg,
          isStreaming: false,
          stoppedByUser: true,
          elapsedMs: msg.startedAt ? Date.now() - msg.startedAt : msg.elapsedMs
        } : msg
      )
    );
    setStreamingState({ isStreaming: false });
    setIsLoading(false);
  }, [adapter, currentSession?.sessionId]);
  const loadSession = useCallback(
    (session) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      activeExecutionIdRef.current = null;
      streamingSourceStripperRef.current = null;
      accumContentRef.current = "";
      accumProcessedContentRef.current = "";
      stepSeqRef.current = 0;
      onClearArtifactsRef.current?.();
      setCurrentSession({
        sessionId: session.sessionId,
        title: session.title,
        updatedAt: session.updatedAt,
        status: session.status,
        contextId: session.contextId,
        model: session.model
      });
      setActiveContext(session.contextId);
      const allExtractedArtifacts = [];
      const cleanedMessages = session.messages.map((msg) => {
        if (msg.role !== "assistant" || !msg.content) {
          return { ...msg, timestamp: new Date(msg.timestamp) };
        }
        const { cleanedContent: afterArtifacts, artifacts } = extractArtifactsFromContent(
          msg.content,
          msg.id
        );
        if (artifacts.length > 0) allExtractedArtifacts.push(...artifacts);
        const { cleanedContent: afterCitations, citations } = extractCitationsFromContent(
          afterArtifacts,
          msg.sources ?? []
        );
        const { cleanedContent: afterRecords, records } = extractRecordTagsFromContent(afterCitations);
        const { cleanedContent } = extractSuggestionsFromContent(afterRecords);
        return {
          ...msg,
          content: cleanedContent,
          timestamp: new Date(msg.timestamp),
          sources: citations.length > 0 ? citations : msg.sources,
          records: records.length > 0 ? records : msg.records,
          ...artifacts.length > 0 ? {
            artifactIds: [...msg.artifactIds ?? [], ...artifacts.map((a) => a.artifactId)]
          } : {}
        };
      });
      const lastUserMsg = [...session.messages].reverse().find((m) => m.role === "user" && typeof m.content === "string" && m.content.length > 0);
      lastUserMessageRef.current = lastUserMsg?.content ?? "";
      resumableExecutionIdRef.current = session.resumableExecutionId ?? null;
      setResumeState(session.resumeState ?? null);
      if (session.activeExecutionId && typeof adapter.getExecutionStream === "function") {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        activeExecutionIdRef.current = session.activeExecutionId;
        const assistantMessage = createAssistantMessage();
        setMessages([...cleanedMessages, assistantMessage]);
        setStreamingState({
          isStreaming: true,
          currentMessageId: assistantMessage.id,
          executionId: session.activeExecutionId
        });
        setIsLoading(true);
        void adapter.getExecutionStream(session.activeExecutionId, 0, { signal: controller.signal }).then((stream) => {
          return consumeStream(stream.getReader(), assistantMessage.id, controller.signal);
        }).catch((error) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          setMessages(
            (prev) => prev.map(
              (msg) => msg.id === assistantMessage.id ? {
                ...msg,
                isStreaming: false,
                error: error instanceof Error ? error.message : "Unexpected error"
              } : msg
            )
          );
          setStreamingState({ isStreaming: false });
          setIsLoading(false);
        });
      } else {
        setMessages(cleanedMessages);
        setStreamingState({ isStreaming: false });
        setIsLoading(false);
      }
      if (allExtractedArtifacts.length > 0) {
        onArtifactsReadyRef.current?.(allExtractedArtifacts);
      }
      if (session.artifacts?.length) {
        onArtifactsReadyRef.current?.(session.artifacts);
      }
    },
    [setCurrentSession, setActiveContext, adapter, consumeStream]
  );
  const switchSession = useCallback(
    async (sessionId) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      activeExecutionIdRef.current = null;
      streamingSourceStripperRef.current = null;
      accumContentRef.current = "";
      accumProcessedContentRef.current = "";
      stepSeqRef.current = 0;
      setStreamingState({ isStreaming: false });
      setIsLoading(false);
      setIsSessionLoading(true);
      try {
        const full = await adapter.loadSession(sessionId);
        loadSession(full);
        return full;
      } finally {
        setIsSessionLoading(false);
      }
    },
    [adapter, loadSession]
  );
  const canResolveToolApprovals = typeof adapter.resolveToolApproval === "function";
  const patchToolApproval = useCallback(
    (approvalId, patch) => {
      setMessages(
        (prev) => prev.map((msg) => {
          if (!msg.toolApprovals?.some((a) => a.approvalId === approvalId)) return msg;
          return {
            ...msg,
            toolApprovals: msg.toolApprovals.map(
              (a) => a.approvalId === approvalId ? patch(a) : a
            )
          };
        })
      );
    },
    []
  );
  const resolveToolApproval = useCallback(
    async (approval, decision, reason) => {
      const resolve = adapter.resolveToolApproval?.bind(adapter);
      if (!resolve) return;
      patchToolApproval(approval.approvalId, (a) => ({
        ...a,
        status: decision,
        reason: reason ?? a.reason ?? null,
        error: void 0
      }));
      try {
        await resolve({
          sessionId: currentSession?.sessionId ?? "",
          approval,
          decision,
          ...reason ? { reason } : {}
        });
      } catch (error) {
        patchToolApproval(approval.approvalId, (a) => ({
          ...a,
          status: "pending",
          error: error instanceof Error ? error.message : "Failed to resolve the approval"
        }));
      }
    },
    [adapter, currentSession?.sessionId, patchToolApproval]
  );
  return useMemo(
    () => ({
      messages,
      streamingState,
      isStreaming: streamingState.isStreaming,
      isLoading,
      error: streamingState.error,
      currentSessionId: currentSession?.sessionId,
      currentSessionTitle: currentSession?.title,
      adapter,
      sendMessage,
      stopStreaming,
      clearMessages,
      retryLastMessage,
      retryMessage,
      resumeState,
      resumeRun,
      loadSession,
      isSessionLoading,
      switchSession,
      canResolveToolApprovals,
      resolveToolApproval
    }),
    [
      messages,
      streamingState,
      isLoading,
      currentSession?.sessionId,
      currentSession?.title,
      adapter,
      sendMessage,
      stopStreaming,
      clearMessages,
      retryLastMessage,
      retryMessage,
      resumeState,
      resumeRun,
      loadSession,
      isSessionLoading,
      switchSession,
      canResolveToolApprovals,
      resolveToolApproval
    ]
  );
}
function ChatStateProvider({
  children,
  onArtifactsReady,
  onClearArtifacts
}) {
  const chatState = useProvideChat(onArtifactsReady, onClearArtifacts);
  return createElement(ChatStateContext.Provider, { value: chatState }, children);
}
function useChat() {
  const context = useContext(ChatStateContext);
  return context ?? useProvideChat();
}
function useConversationHistory() {
  const { adapter } = useChatContext();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!adapter?.listSessions) return;
    setIsLoading(true);
    try {
      const result = await adapter.listSessions({ page: 1, limit: 50 });
      setSessions(result.sessions ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const deleteSession = useCallback(
    async (sessionId) => {
      if (!adapter?.deleteSession) return;
      await adapter.deleteSession(sessionId);
      await refresh();
    },
    [adapter, refresh]
  );
  return { sessions, isLoading, refresh, deleteSession };
}
function saveBlob(blob, fileName) {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 6e4);
}
function useSessionFiles() {
  const { adapter, currentSession, config } = useChatContext();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const sessionId = currentSession?.sessionId;
  const refresh = useCallback(async () => {
    if (!sessionId || !adapter.listSessionFiles || !config.enableFileUpload) return;
    setIsLoading(true);
    try {
      const result = await adapter.listSessionFiles(sessionId);
      setFiles(result);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [adapter, sessionId]);
  useEffect(() => {
    setFiles([]);
  }, [sessionId]);
  useEffect(() => {
    if (sessionId && config.enableFileUpload) void refresh();
  }, [panelOpen, sessionId, refresh, config.enableFileUpload]);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const deleteFile = useCallback(
    async (fileId) => {
      if (!sessionId || !adapter.deleteSessionFile) return;
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      await adapter.deleteSessionFile(sessionId, fileId).catch(() => {
        void refresh();
      });
    },
    [adapter, sessionId, refresh]
  );
  const downloadFile = useCallback(
    async (file) => {
      if (sessionId && adapter.downloadFile) {
        try {
          const blob = await adapter.downloadFile(sessionId, file.id);
          saveBlob(blob, file.fileName);
          return;
        } catch (err) {
          console.error("downloadFile failed", err);
          return;
        }
      }
      if (file.downloadUrl && typeof window !== "undefined") {
        window.open(file.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
    [adapter, sessionId]
  );
  return {
    files,
    isLoading,
    panelOpen,
    openPanel,
    closePanel,
    refresh,
    deleteFile,
    downloadFile
  };
}
function useSources() {
  const [activeMessageId, setActiveMessageId] = useState();
  const [activeSources, setActiveSources] = useState([]);
  const [panelState, setPanelState] = useState({
    isOpen: false
  });
  const openSources = useCallback(
    (messageId, sources, scrollToIndex) => {
      setActiveMessageId(messageId);
      setActiveSources(sources);
      setPanelState({ isOpen: true, scrollToIndex });
    },
    []
  );
  const closeSources = useCallback(() => {
    setPanelState({ isOpen: false });
  }, []);
  return useMemo(
    () => ({
      activeSources,
      activeMessageId,
      panelState,
      openSources,
      closeSources
    }),
    [activeSources, activeMessageId, panelState, openSources, closeSources]
  );
}
function useStickyBottom(containerRef) {
  const anchorRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === "undefined") return;
    const root = containerRef?.current ?? anchor.closest(".ais-messages");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsAtBottom(entry.isIntersecting);
      },
      { root: root ?? null, threshold: 0, rootMargin: "0px 0px 80px 0px" }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [containerRef]);
  const scrollToBottom = useCallback((behavior = "smooth") => {
    anchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);
  return { anchorRef, isAtBottom, scrollToBottom };
}
function supportsDvh() {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("height", "100dvh");
}
function useViewportHeightFallback(ref) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (supportsDvh()) return;
    const viewport = window.visualViewport;
    const el = ref.current;
    if (!viewport || !el) return;
    const update = () => {
      el.style.setProperty("--ais-viewport-height", `${Math.round(viewport.height)}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    return () => {
      viewport.removeEventListener("resize", update);
      el.style.removeProperty("--ais-viewport-height");
    };
  }, [ref]);
}
function useVisualViewport(enabled = true) {
  const [rect, setRect] = useState(() => {
    if (typeof window === "undefined" || !window.visualViewport) return null;
    return {
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop
    };
  });
  useEffect(() => {
    if (!enabled) return;
    const vv = typeof window === "undefined" ? void 0 : window.visualViewport;
    if (!vv) return;
    let frame = null;
    const apply = () => {
      frame = null;
      setRect((prev) => {
        if (prev && Math.abs(prev.height - vv.height) < 1 && Math.abs(prev.offsetTop - vv.offsetTop) < 1) {
          return prev;
        }
        return { height: vv.height, offsetTop: vv.offsetTop };
      });
    };
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(apply);
    };
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", onScroll);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);
  return enabled ? rect : null;
}
var EDITABLE_SELECTOR = 'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled]), [contenteditable=""], [contenteditable="true"]';
function isEditableFocused() {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el || typeof el.matches !== "function") return false;
  try {
    return el.matches(EDITABLE_SELECTOR);
  } catch {
    return false;
  }
}
function isKeyboardOpen(rect) {
  if (!rect || typeof window === "undefined") return false;
  if (!isEditableFocused()) return false;
  const occluded = window.innerHeight - rect.height;
  return occluded > Math.max(150, window.innerHeight * 0.25);
}
function overlayHeight(rect) {
  if (!rect) return "100dvh";
  return isKeyboardOpen(rect) ? rect.height : `calc(${rect.height}px + env(safe-area-inset-bottom, 0px))`;
}
function useKeyboardOpen(enabled = true) {
  const viewport = useVisualViewport(enabled);
  const [editableFocused, setEditableFocused] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const sync = () => setEditableFocused((prev) => {
      const next = isEditableFocused();
      return prev === next ? prev : next;
    });
    sync();
    window.addEventListener("focusin", sync);
    window.addEventListener("focusout", sync);
    return () => {
      window.removeEventListener("focusin", sync);
      window.removeEventListener("focusout", sync);
    };
  }, [enabled]);
  if (!enabled || !editableFocused) return false;
  return isKeyboardOpen(viewport);
}
var MOBILE_BREAKPOINT_PX = 768;
function useIsMobile(breakpoint = MOBILE_BREAKPOINT_PX) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return isMobile;
}

export { ChatProvider, ChatStateProvider, MOBILE_BREAKPOINT_PX, extractArtifactsFromContent, extractRecordTagsFromContent, extractSuggestionsFromContent, getSlashCommandRegistry, isEditableFocused, isKeyboardOpen, overlayHeight, registerSlashCommand, supportsDvh, useArtifacts, useChat, useChatContext, useConversationHistory, useIsMobile, useKeyboardOpen, useSessionFiles, useSources, useStickyBottom, useViewportHeightFallback, useVisualViewport };
//# sourceMappingURL=chunk-VH47IJ7T.js.map
//# sourceMappingURL=chunk-VH47IJ7T.js.map