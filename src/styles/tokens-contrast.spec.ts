/* eslint-disable @typescript-eslint/ban-ts-comment -- Node fs/path; main tsconfig has no @types/node */
// @ts-nocheck
import { readFileSync } from "node:fs";
import { join } from "node:path";

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "").trim();
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Monochrome design tokens & WCAG contrast audit", () => {
  const tokensCss = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");

  it("tokens.css defines monochrome defaults for light and dark modes", () => {
    expect(tokensCss).toContain("--chat-accent: #000000;");
    expect(tokensCss).toContain("--chat-accent-foreground: #ffffff;");
    expect(tokensCss).toContain("--message-ai-text: var(--foreground, #000000);");
    expect(tokensCss).toContain("--chat-border: var(--border, #e4e4e7);");

    // Dark mode block
    expect(tokensCss).toContain("--chat-bg: var(--background, #000000);");
    expect(tokensCss).toContain("--chat-accent: #ffffff;");
    expect(tokensCss).toContain("--chat-accent-foreground: #000000;");
    expect(tokensCss).toContain("--message-ai-text: var(--foreground, #ffffff);");
    expect(tokensCss).toContain("--chat-border: var(--border, #27272a);");
  });

  it("supports prefers-color-scheme: dark media query", () => {
    expect(tokensCss).toContain("@media (prefers-color-scheme: dark)");
  });

  it("meets high contrast ratio in light mode", () => {
    const lightBg = "#ffffff";
    const lightFg = "#000000";
    const lightMuted = "#71717a";

    // Text to bg should be max contrast (21:1)
    expect(contrastRatio(lightFg, lightBg)).toBeGreaterThanOrEqual(20);
    // Muted text satisfies WCAG AA (>= 4.5:1)
    expect(contrastRatio(lightMuted, lightBg)).toBeGreaterThanOrEqual(4.5);
  });

  it("meets high contrast ratio in dark mode", () => {
    const darkBg = "#000000";
    const darkFg = "#ffffff";
    const darkMuted = "#a1a1aa";

    // Text to bg should be max contrast (21:1)
    expect(contrastRatio(darkFg, darkBg)).toBeGreaterThanOrEqual(20);
    // Muted text satisfies WCAG AAA (>= 7:1)
    expect(contrastRatio(darkMuted, darkBg)).toBeGreaterThanOrEqual(7.0);
  });
});
