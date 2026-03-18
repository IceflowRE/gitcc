// See: https://rollupjs.org/introduction/

import {default as commonjs} from "@rollup/plugin-commonjs"
import {nodeResolve} from "@rollup/plugin-node-resolve"
import {default as typescript} from "@rollup/plugin-typescript"

const config = {
    input: "src/main.ts",
    output: {
        esModule: true,
        file: "dist/index.js",
        format: "es",
        sourcemap: true
    },
    plugins: [typescript(), nodeResolve({preferBuiltins: true}), commonjs()]
}

export default config
