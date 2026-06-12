/** @jest-config-loader ts-node */
import { defineConfig } from "jest"

export default defineConfig({
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true }]
    }
})
