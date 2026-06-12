// See: https://rollupjs.org/introduction/

import { default as commonjs } from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { default as typescript } from "@rollup/plugin-typescript"
import { builtinModules } from "module"

export default [
    {
        input: "src/main.ts",
        output: {
            esModule: true,
            file: "dist/index.js",
            format: "es"
        },
        plugins: [typescript(), nodeResolve({ preferBuiltins: true }), commonjs()]
    },
    {
        input: "src/gitcc.ts",
        external: (id: string) => id.startsWith("node:") || builtinModules.includes(id),
        output: {
            esModule: true,
            file: "dist/gitcc.js",
            format: "es"
        },
        plugins: [typescript()]
    }
]
