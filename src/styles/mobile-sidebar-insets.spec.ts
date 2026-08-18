/* eslint-disable @typescript-eslint/ban-ts-comment -- Node fs/path; main tsconfig has no @types/node */
// @ts-nocheck
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/styles/styles-no-base.css"), "utf8");

/** Return the body of the `@media <query>` block that contains `marker`. */
function mediaBody(source: string, query: string, marker: string): string {
  const needle = `@media ${query}`;
  let from = 0;
  while (from < source.length) {
    const start = source.indexOf(needle, from);
    if (start < 0) break;
    const open = source.indexOf("{", start);
    let depth = 0;
    for (let i = open; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) {
          const body = source.slice(open + 1, i);
          if (body.includes(marker)) return body;
          from = i + 1;
          break;
        }
      }
    }
  }
  throw new Error(`Missing @media ${query} containing ${marker}`);
}

/** First rule whose selector is exactly `selector` (not a prefix of another). */
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

function declaresSafeTop(body: string): boolean {
  return /padding-top\s*:[^;]*safe-area-inset-top/.test(body);
}

function declaresSafeBottom(body: string): boolean {
  return /padding-bottom\s*:[^;]*safe-area-inset-bottom/.test(body);
}

describe("mobile overlay sidebar safe-area insets", () => {
  const overlay = mediaBody(css, "(max-width: 1024px)", ".ais-sidebar {");
  const sidebar = ruleBody(overlay, ".ais-sidebar");
  const header = ruleBody(overlay, ".ais-sidebar-header");

  it("lets the header own safe-area-inset-top exactly once", () => {
    expect(declaresSafeTop(sidebar)).toBe(false);
    expect(declaresSafeTop(header)).toBe(true);
  });

  it("applies safe-area-inset-bottom once on the drawer, not stacked with extra pad", () => {
    expect(declaresSafeBottom(sidebar)).toBe(true);
    expect(declaresSafeBottom(header)).toBe(false);
    expect(sidebar).not.toMatch(/padding-bottom\s*:\s*max\(/);
    expect(sidebar).not.toMatch(/padding-bottom\s*:\s*calc\(/);
  });
});

describe("recents + composer mobile insets", () => {
  const phone = mediaBody(css, "(max-width: 768px)", ".ais-recents-page {");

  it("does not add safe-area-inset-top on the Recents page (shell header owns it)", () => {
    const page = ruleBody(phone, ".ais-recents-page");
    expect(declaresSafeTop(page)).toBe(false);
  });

  it("uses a 16px Recents search field", () => {
    const search = ruleBody(phone, ".ais-recents-search");
    expect(search).toMatch(/font-size:\s*16px/);
  });

  it("gives the composer a single bottom inset with no corner-clearance stack", () => {
    const composer = ruleBody(css, ".ais-composer");
    expect(composer).toMatch(/padding-bottom:\s*max\(\s*10px,\s*env\(safe-area-inset-bottom/);
    expect(composer).not.toMatch(/padding-bottom:[^;]*--ais-corner-clearance/);
    const footer = ruleBody(css, ".ais-chat-footer");
    expect(declaresSafeBottom(footer)).toBe(false);
  });
});
