export interface User {
    email?: string
    name?: string
    username?: string
}

export interface Commit {
    author?: User
    committer?: User
    distinct?: boolean
    hexsha?: string
    timestamp?: Date
    message?: string
}

// returns summary and description of a commit message
export function splitCommitMessage(msg: string): [string, string] {
    if (msg === undefined) {
        return ["", ""]
    }

    const idx = msg.indexOf("\n\n")
    if (idx === -1) {
        return [msg.replace(/\n$/, ""), ""]
    }
    const summary: string = msg.slice(0, idx)
    const description: string = msg.slice(idx + 2).replace(/\n$/, "")

    return [summary, description]
}
