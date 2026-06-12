import fs from "fs"
import { resolve } from "path"
import { pathToFileURL } from "url"
import { Commit, User } from "@/commit"
import { Client as IClient } from "@/platform/common"

export class Client implements IClient {
    private readonly owner: string
    private readonly repo: string
    private readonly sha: string
    private readonly eventName: string
    private readonly serverUrl: string
    private readonly token: string
    private readonly payload: Record<string, unknown>

    constructor() {
        const repository = process.env.GITHUB_REPOSITORY!
        const [owner, repo] = repository.split("/", 2)
        this.owner = owner
        this.repo = repo
        this.sha = process.env.GITHUB_SHA!
        this.eventName = process.env.GITHUB_EVENT_NAME!
        this.serverUrl = process.env.GITHUB_SERVER_URL!
        this.token = process.env.GITHUB_TOKEN!
        this.payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH!, "utf-8"))
    }

    private async get(path: string): Promise<unknown> {
        const res = await fetch(`${this.serverUrl}/api/v1${path}`, {
            headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" }
        })
        if (!res.ok) {
            throw new Error(`Forgejo API error: ${res.status} ${res.statusText} — ${path}`)
        }
        return res.json()
    }

    async downloadValidatorFile(validatorFile: string): Promise<[string, string]> {
        const data = (await this.get(
            `/repos/${this.owner}/${this.repo}/contents/${validatorFile}?ref=${this.sha}`
        )) as Record<string, unknown>
        if (!("content" in data)) {
            throw new Error(`'${validatorFile}' is not a file or has no content`)
        }
        const content = Buffer.from(data.content as string, "base64").toString("utf-8")
        const outputPath = pathToFileURL(resolve("./validator.mjs"))
        fs.writeFileSync(outputPath, content)
        return [(data.html_url as string) ?? "", outputPath.toString()]
    }

    async getCommits(): Promise<Commit[]> {
        switch (this.eventName) {
            case "pull_request": {
                if (!this.payload.pull_request) {
                    throw new Error("pull_request event has no PR in payload")
                }
                return this.getPullRequestCommits(this.payload.pull_request as Record<string, unknown>)
            }
            case "push":
            default: {
                const commits = this.payload.commits as Record<string, unknown>[]
                if (commits?.length > 0) {
                    return commits.map((c: Record<string, unknown>) => parseCommit(c))
                } else if (this.payload.head_commit) {
                    return [parseCommit(this.payload.head_commit as Record<string, unknown>)]
                } else {
                    const data = (await this.get(
                        `/repos/${this.owner}/${this.repo}/git/commits/${this.sha}`
                    )) as Record<string, unknown>
                    const committer = data.committer as Record<string, unknown>
                    return [parseCommit(data, this.sha, committer.date as string)]
                }
            }
        }
    }

    private async getCommitCreation(sha: string): Promise<string> {
        const data = (await this.get(`/repos/${this.owner}/${this.repo}/git/commits/${sha}`)) as Record<string, unknown>
        const committer = data.committer as Record<string, unknown>
        return committer.date as string
    }

    private async getPullRequestCommits(pr: Record<string, unknown>): Promise<Commit[]> {
        const base = pr.base as Record<string, unknown>
        const head = pr.head as Record<string, unknown>
        const headRepo = head.repo as Record<string, unknown>
        const headOwner = headRepo.owner as Record<string, unknown>
        const since = await this.getCommitCreation(base.sha as string)

        const commits: Commit[] = []
        let page = 1
        while (true) {
            const data = (await this.get(
                `/repos/${headOwner.login}/${headRepo.name}/commits?sha=${head.ref}&since=${since}&limit=50&page=${page}`
            )) as Record<string, unknown>[]
            for (const raw of data) {
                if (raw.sha === base.sha) continue
                const inner = raw.commit as Record<string, unknown>
                const committer = inner.committer as Record<string, unknown>
                commits.push(parseCommit(inner, raw.sha as string, (committer?.date as string) ?? ""))
            }
            if (data.length < 50) break
            page++
        }
        return commits
    }
}

function parseCommit(commit: Record<string, unknown>, sha = "", timestamp = ""): Commit {
    const timestampValue = commit.timestamp ?? timestamp
    return {
        author: commit.author as User,
        committer: commit.committer as User,
        distinct: (commit.distinct as boolean) ?? false,
        hexsha: (commit.id as string) ?? sha,
        timestamp: timestampValue ? new Date(timestampValue as string) : undefined,
        message: commit.message as string
    }
}
