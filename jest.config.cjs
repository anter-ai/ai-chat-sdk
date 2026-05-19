/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  resolver: "ts-jest-resolver",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "<rootDir>/tsconfig.jest.json" }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-markdown|remark-gfm|micromark|devlop|vfile|unist|unified|bail|is-plain-obj|trough|decode-named-character-reference|character-entities|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|vfile-message|mdast-util-from-markdown|mdast-util-to-string|ccount|mdast-util-find-and-replace|mdast-util-gfm-autolink-literal|mdast-util-gfm-footnote|mdast-util-gfm-strikethrough|mdast-util-gfm-table|mdast-util-gfm-task-list-item|mdast-util-gfm|markdown-table|escape-string-regexp)/)",
  ],
  testMatch: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
};
