/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Transpile-only: type-checking is covered by `pnpm check-types` (tsc),
        // and per-file transpilation keeps the config independent of whether
        // the @anter/ai-chat-sdk dist has been built in the current checkout.
        diagnostics: false,
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          target: "ES2022",
          esModuleInterop: true,
          isolatedModules: true,
          strict: true,
        },
      },
    ],
  },
};
