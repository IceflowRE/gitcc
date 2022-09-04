// GitHub support utility.

import {GitHub} from "@actions/github/lib/utils";
import * as github from "@actions/github";
import * as core from "@actions/core";
import fs from "fs";
import {Commit} from "./commit";
import {Result, Status} from "./commit-validator";

// return html url to validator file and local filepath to downloaded file
export async function download_validator_file(validator_file: string, octokit: InstanceType<typeof GitHub>): Promise<[string, string]> {
    const response = await octokit.rest.repos.getContent({
        path: validator_file,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: github.context.sha,
    })
    if (response.status !== 200) {
        core.error(JSON.stringify(response.data))
        core.setFailed(`failed to retrieve validator file '${response.url}'`)
        return ["", ""]
    }
    if (Array.isArray(response.data)) {
        core.setFailed(`given path '${response.url}' was a directory`)
        return ["", ""]
    }
    if (!("content" in response.data)) {
        core.setFailed(`download of '${response.url}' failed`)
        return ["", ""]
    }
    const buffer = Buffer.from(response.data.content, 'base64').toString('utf-8')
    fs.writeFile("./validator.mjs", buffer, err => {
        if (err) throw err
    })
    return [response.data.html_url || "", "../../validator.mjs"]
}

export async function get_commit_creation(octokit: InstanceType<typeof GitHub>): Promise<string> {
    const response = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        commit_sha: github.context.payload.pull_request?.base.sha,
    })
    if (response.status !== 200) {
        core.error(JSON.stringify(response.data))
        throw Error("Did not found creation date!")
    }
    if (Array.isArray(response.data)) {
        throw Error("Commit creation date contained an array!")
    }
    return response.data["committer"]["date"]
}

export async function get_commits(octokit: InstanceType<typeof GitHub>): Promise<Commit[]> {
    const commits: Commit[] = []
    switch (github.context.eventName) {
        case 'pull_request': {
            const pages = Math.floor(github.context.payload.pull_request?.commits / 100) + 1
            for (let page = 1; page <= pages; page++) {
                const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                    owner: github.context.payload.pull_request?.head.repo.owner.login,
                    repo: github.context.payload.pull_request?.head.repo.name,
                    sha: github.context.payload.pull_request?.head.ref,
                    since: await get_commit_creation(octokit),
                    per_page: 100,
                    page,
                })
                if (response.status !== 200) {
                    core.error(JSON.stringify(response.data))
                    return []
                }
                for (const raw_commit of response.data) {
                    // skip base commit
                    if (raw_commit.sha === github.context.payload.pull_request?.base.sha) {
                        continue
                    }
                    commits.push(new Commit(raw_commit.commit, raw_commit.sha, raw_commit.commit.committer?.date))
                }
            }
            break
        }
        case 'push':
        default: {
            if ('commits' in github.context.payload) {
                for (const commit of github.context.payload['commits']) {
                    commits.push(new Commit(commit))
                }
            }
        }
    }
    return commits
}

export function print_results(checks: Result[]): void {
    let all_ok = true
    for (const check of checks) {
        const msg: string = check.toString(true)
        switch (check.status) {
            case Status.Ok:
                core.info(msg)
                break
            case Status.Warning:
                core.warning(msg)
                break
            case Status.Failure:
                core.error(msg)
                break
        }
        all_ok = all_ok && check.status !== Status.Failure
    }
    if (all_ok) {
        core.info("\u001b[0;32mAll commits have the correct format!")
    } else {
        core.setFailed("\u001b[0;31mNot all commits were correct!")
    }
}
