import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  // Use the native ESM preset provided by ts-jest
  preset: "ts-jest/presets/default-esm",

  // Ensure Jest simulates a Node.js execution environment rather than a browser
  testEnvironment: "node",

  // Handle TypeScript files with ESM support enabled
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
      },
    ],
  },

  // Map module extensions to support native NodeNext module resolution rules (.js extensions)
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Define where Jest should search for test files
  // roots: ["<rootDir>/src"],

  // Explicitly look for test files inside your src directory structure
  // testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Tell Jest to treat these extensions as ES Modules
  extensionsToTreatAsEsm: [".ts"],
  coveragePathIgnorePatterns: ["./src/util/initDataLoad.ts"],
};

export default jestConfig;
