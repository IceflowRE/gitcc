import { Commit, splitCommitMessage } from "@/commit"
import { greenText, redText, yellowText } from "@/utils"

export enum Status {
    Invalid = "Invalid",
    Valid = "OK",
    Warning = "Warning"
}

export interface Result {
    status: Status
    message: string
    commit?: Commit
}

export function formatResult(result: Result, colored: boolean = false): string {
    let text: string = result.status.toString()
    if (colored) {
        switch (result.status) {
            case Status.Invalid:
                text = redText(text)
                break
            case Status.Warning:
                text = yellowText(text)
                break
            case Status.Valid:
                text = greenText(text)
                break
        }
    }

    if (result.commit) {
        const [summary, _]: [string, string] = splitCommitMessage(result.commit?.message ?? "")
        text += ` | ${result.commit.hexsha} | ${summary}`
    }
    if (result.status !== Status.Valid && result.message) {
        text += `\n    : ${result.message}`
    }
    return text
}

export function valid(commit?: Commit): Result {
    return { status: Status.Valid, message: "", commit }
}

export function warning(message: string, commit?: Commit): Result {
    return { status: Status.Warning, message, commit }
}

export function invalid(message: string, commit?: Commit): Result {
    return { status: Status.Invalid, message, commit }
}
