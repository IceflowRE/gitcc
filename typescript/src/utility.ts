import * as fs from "fs"
import * as core from '@actions/core'
import * as github from "@actions/github"
import {Commit} from './commit'
import {CommitValidator, Result, Status} from './commit-validator'
import {SimpleTag} from './validation'
import {GitHub} from "@actions/github/lib/utils"

export async function get_shipped_validator(validator: string): Promise<CommitValidator> {
    switch (validator) {
        case 'SimpleTag':
            return new SimpleTag()
        default:
            throw Error('Invalid validator name!')
    }
}

const _importDynamic = new Function('modulePath', 'return import(modulePath)')

export async function import_validator_cls(validator_file: string): Promise<typeof CommitValidator> {
    const validation = await _importDynamic(validator_file)
    validation.import_types(CommitValidator, Commit, Result, Status)
    return validation.createValidator()
}

export function print_results(checks: Result[]): void {
    let all_ok = true
    for (const check of checks) {
        const msg: string = check.toString()
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
        core.info("All commits have the correct format!")
    } else {
        core.setFailed("Not all commits were correct!")
    }
}

export function check_commits(commits: Commit[], validator: CommitValidator): Result[] {
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

// return html url to validator file and local filepath to downloaded file
export async function download_validator_file(validator_file: string, octokit: InstanceType<typeof GitHub>): Promise<[string, string]> {
    const response = await octokit.rest.repos.getContent({
        path: validator_file,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: github.context.payload["sha"],
    })
    core.info(JSON.stringify(response))
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
    core.info("get commit")
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sha: github.context.payload.pull_request?.base.sha,
    })
    if (response.status !== 200) {
        core.error(JSON.stringify(response.data))
        return ""
    }
    core.info(JSON.stringify(response.data))
    if (Array.isArray(response.data)) {
        return ""
    }
    return response.data["committer"]["date"]
}

export async function get_commits(octokit: InstanceType<typeof GitHub>): Promise<Commit[]> {
    const commits: Commit[] = []
    switch (github.context.eventName) {
        case 'pull_request': {
            const pages = github.context.payload.pull_request?.commits % 100 + 1
            core.info("pull req")
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
                core.info(JSON.stringify(response.data))
                for (const raw_commit of response.data) {
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
