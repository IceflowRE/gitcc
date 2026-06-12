import * as core from "@actions/core"
import { Commit } from "@/commit"
import { Result, Status, formatResult } from "@/result"
import { greenText, redText } from "@/utils"

export interface Validator {
    validate(commit: Commit): Result
}

export function checkCommits(validator: Validator, commits: Commit[]): Result[] {
    const checks: Result[] = []
    for (const commit of commits) {
        const res: Result = validator.validate(commit)
        if (res.commit === undefined) {
            res.commit = commit
        }
        checks.push(validator.validate(commit))
    }
    return checks
}

export function parseValidatorOptions(options: string[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const option of options) {
        const sepCount: number = option.search(/[=:]/)
        if (sepCount === -1) {
            throw new Error(`Invalid option format '${option}'. Expected 'key=value' or 'key: value'`)
        }
        const key: string = option.slice(0, sepCount).trim().replace(/^"|"$/g, "")
        const value: string = option
            .slice(sepCount + 1)
            .trim()
            .replace(/^"|"$/g, "")
        if (!key) {
            throw new Error(`Invalid option format '${option}'. Key cannot be empty`)
        }
        result[key] = value
    }
    return result
}

export function printResults(checks: Result[]): void {
    let all_ok = true
    for (const check of checks) {
        switch (check.status) {
            case Status.Valid:
                core.info(formatResult(check, true))
                break
            case Status.Warning:
                core.warning(formatResult(check, true))
                break
            case Status.Invalid:
                core.setFailed(formatResult(check, true))
                break
        }
        all_ok = all_ok && check.status !== Status.Invalid
    }
    if (all_ok) {
        core.info(greenText("All commits are valid!"))
    } else {
        core.info(redText("Some commits are not valid!"))
    }
}
