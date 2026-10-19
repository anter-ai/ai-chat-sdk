/* eslint-disable @typescript-eslint/ban-ts-comment -- Node fs/path; main tsconfig has no @types/node */
// @ts-nocheck
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/styles/styles-no-base.css"), "utf8");
const tokensCss = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");

function ruleBody(source: string, selector: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`,
  );
  const match = pattern.exec(source);
  if (!match || match.index === undefined) {
    throw new Error(`Missing rule ${selector}`);
  }
  const open = source.indexOf("{", match.index);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`Unclosed rule ${selector}`);
}

describe("typography and font consistency across SDK and empty state", () => {
  it("defines default font family tokens and sets font-family on [data-chat-provider]", () => {
    const providerRule = ruleBody(tokensCss, "[data-chat-provider]");
    expect(providerRule).toContain("--chat-font-sans");
    expect(providerRule).toContain('"Figtree"');
    expect(providerRule).toContain("--chat-font-mono");
    expect(providerRule).toContain('"JetBrains Mono"');
    expect(providerRule).toContain("font-family: var(--chat-font-sans);");
  });

  it("ensures form controls inside [data-chat-provider] inherit font-family", () => {
    expect(tokensCss).toMatch(
      /\[data-chat-provider\]\s+button,\s*\n\s*\[data-chat-provider\]\s+input,\s*\n\s*\[data-chat-provider\]\s+textarea,\s*\n\s*\[data-chat-provider\]\s+select\s*\{\s*font-family:\s*inherit;/,
    );
  });

  it("ensures composer input, textarea, and placeholder inherit font-family", () => {
    const composerInput = ruleBody(css, ".ais-composer-input");
    expect(composerInput).toMatch(/font-family:\s*inherit;/);

    const placeholder = ruleBody(css, ".ais-composer-input::placeholder");
    expect(placeholder).toMatch(/font-family:\s*inherit;/);
  });

  it("ensures widget and sidepanel titles inherit font-family consistently", () => {
    const widgetTitle = ruleBody(css, ".ais-widget-title");
    expect(widgetTitle).toMatch(/font-family:\s*inherit;/);

    const sidepanelTitle = ruleBody(css, ".ais-sidepanel-title");
    expect(sidepanelTitle).toMatch(/font-family:\s*inherit;/);
  });

  it("message bubble uses 14.5px font-size", () => {
    const bubble = ruleBody(css, ".ais-message-bubble");
    expect(bubble).toMatch(/font-size:\s*14\.5px/);
  });

  it("subheading matches 14.5px font-size and 440px max-width across standard, compact, and widget-popover", () => {
    const baseSubheading = ruleBody(css, ".ais-empty-subheading");
    expect(baseSubheading).toMatch(/font-size:\s*14\.5px/);
    expect(baseSubheading).toMatch(/max-width:\s*440px/);

    const compactSubheading = ruleBody(css, ".ais-empty-state.is-compact .ais-empty-subheading");
    expect(compactSubheading).toMatch(/font-size:\s*14\.5px/);
    expect(compactSubheading).toMatch(/max-width:\s*440px/);

    const widgetSubheading = ruleBody(css, ".ais-widget-popover .ais-empty-subheading");
    expect(widgetSubheading).toMatch(/font-size:\s*14\.5px/);
    expect(widgetSubheading).toMatch(/max-width:\s*440px/);
  });

  it("starter card title uses 14.5px font-size and 700 font-weight", () => {
    const baseTitle = ruleBody(css, ".ais-starter-card-title");
    expect(baseTitle).toMatch(/font-size:\s*14\.5px/);
    expect(baseTitle).toMatch(/font-weight:\s*700/);

    const compactTitle = ruleBody(css, ".ais-empty-state.is-compact .ais-starter-card-title");
    expect(compactTitle).toMatch(/font-size:\s*14\.5px/);
    expect(compactTitle).toMatch(/font-weight:\s*700/);

    const widgetTitle = ruleBody(css, ".ais-widget-popover .ais-starter-card-title");
    expect(widgetTitle).toMatch(/font-size:\s*14\.5px/);
    expect(widgetTitle).toMatch(/font-weight:\s*700/);
  });

  it("starter card description uses 13px font-size", () => {
    const baseDesc = ruleBody(css, ".ais-starter-card-desc");
    expect(baseDesc).toMatch(/font-size:\s*13px/);

    const compactDesc = ruleBody(css, ".ais-empty-state.is-compact .ais-starter-card-desc");
    expect(compactDesc).toMatch(/font-size:\s*13px/);

    const widgetDesc = ruleBody(css, ".ais-widget-popover .ais-starter-card-desc");
    expect(widgetDesc).toMatch(/font-size:\s*13px/);
  });
});
