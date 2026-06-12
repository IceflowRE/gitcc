/*
 * @fileoverview Injects global helpers into the user custom script.
 */
import { registerHooks } from "node:module"
import fs from "fs"
import { Validator } from "@/validator"

const gitccJs = fs.readFileSync(new URL("./gitcc.js", import.meta.url), "utf-8")

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "gitcc") {
            return { shortCircuit: true, url: "gitcc:virtual" }
        }
        return nextResolve(specifier, context)
    },
    load(url, context, nextLoad) {
        if (url === "gitcc:virtual") {
            return {
                shortCircuit: true,
                format: "module",
                source: gitccJs
            }
        }
        return nextLoad(url, context)
    }
})

const dynamicImport = new Function("path", "return import(path)")

export async function importValidator(validatorFile: string, options: Record<string, string>): Promise<Validator> {
    const mod = await dynamicImport(validatorFile)
    if (typeof mod.createValidator !== "function") {
        throw new Error("Validator file must export a 'createValidator(options)' function")
    }
    const validator = mod.createValidator(options)
    if (typeof validator?.validate !== "function") {
        throw new Error("createValidator must return an object with a 'validate(commit)' function")
    }
    return validator as Validator
}
