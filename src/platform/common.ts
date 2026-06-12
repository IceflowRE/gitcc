import * as core from "@actions/core"
import { Client as ForgejoClient } from "@/platform/forgejo"
import { Client as GHClient } from "@/platform/github"
import { Commit } from "@/commit"

export interface Client {
    downloadValidatorFile(validatorFile: string): Promise<[string, string]>
    getCommits(): Promise<Commit[]>
}

export function getClient(): Client {
    if (isForgejo()) {
        return new ForgejoClient()
    }
    return new GHClient()
}

function isForgejo(): boolean {
    const platform: string = core.getInput("platform").toLowerCase()
    if (platform === "forgejo") {
        return true
    }
    if (platform === "github") {
        return false
    }
    return process.env.FORGEJO_TOKEN !== undefined
}
