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

// Return true when not one check was a failure.
export function print_results(checks: Result[]): boolean {
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
    return all_ok
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
    if (response.status !== 200) {
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
