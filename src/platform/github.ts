import fs from "fs"
import os from "os"
import path from "path"
import { pathToFileURL } from "url"
import * as core from "@actions/core"
import * as github from "@actions/github"
import { GitHub } from "@actions/github/lib/utils"
import { Commit, User } from "@/commit"
import { Client as IClient } from "@/platform/common"

type PullRequest = NonNullable<typeof github.context.payload.pull_request>

export class Client implements IClient {
    private octokit: InstanceType<typeof GitHub>

    constructor() {
        const token: string = core.getInput("token") || process.env.GITHUB_TOKEN || ""
        if (!token) {
            throw new Error("GITHUB_TOKEN is not available. Add 'permissions: contents: read' to your workflow job.")
        }
        this.octokit = github.getOctokit(token)
    }

    async downloadValidatorFile(validatorFile: string): Promise<[string, string]> {
        const { data } = await this.octokit.rest.repos.getContent({
            path: validatorFile,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: github.context.sha
        })

        if (Array.isArray(data) || !("content" in data)) {
            throw new Error(`'${validatorFile}' is not a file or has no content`)
        }
        const content = Buffer.from(data.content, "base64").toString("utf-8")
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gitcc-"))
        const outputPath = pathToFileURL(path.join(tmpDir, "validator.mjs"))
        fs.writeFileSync(outputPath, content)
        return [data.html_url ?? "", outputPath.toString()]
    }

    async getCommits(): Promise<Commit[]> {
        const commits: Commit[] = []
        switch (github.context.eventName) {
            case "pull_request": {
                if (!github.context.payload.pull_request) {
                    throw new Error("pull_request event has no PR in payload")
                }
                commits.push(...(await this.getPullRequestCommits(github.context.payload.pull_request)))
                break
            }
            case "push":
            default: {
                const payload = github.context.payload
                if (payload.commits?.length > 0) {
                    for (const commit of payload.commits) {
                        commits.push(parseCommit(commit))
                    }
                } else if (payload.head_commit) {
                    commits.push(parseCommit(payload.head_commit))
                } else {
                    const { data } = await this.octokit.rest.git.getCommit({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        commit_sha: github.context.sha
                    })
                    commits.push(parseCommit(data, github.context.sha, data.committer.date))
                }
                break
            }
        }
        return commits
    }

    private async getPullRequestCommits(pr: PullRequest): Promise<Commit[]> {
        const commits: Commit[] = []
        let page: number = 1
        while (true) {
            const { data } = await this.octokit.rest.pulls.listCommits({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: pr.number,
                per_page: 100,
                page
            })
            for (const raw of data) {
                if (raw.sha === pr.base.sha) {
                    continue
                }
                commits.push(parseCommit(raw.commit, raw.sha, raw.commit.committer?.date ?? ""))
            }
            if (data.length < 100) {
                break
            }
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
