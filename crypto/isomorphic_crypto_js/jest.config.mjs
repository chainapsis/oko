export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^@noble/hashes/sha2(\\.js)?$": "@noble/hashes/sha2.js",
    "^@noble/curves/ed25519(\\.js)?$": "@noble/curves/ed25519.js",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [],
  testTimeout: 60000,
  transform: {
    "^.+\\.(tsx?|mjs|js)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          allowJs: true,
        },
      },
    ],
  },
};
