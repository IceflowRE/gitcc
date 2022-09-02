import {CommitValidator, Result, Status} from './commit-validator'
import * as core from '@actions/core'
import {Commit} from './commit'
import {SimpleTag} from './validation'
import * as github from "@actions/github";
import * as fs from "fs";

export async function get_validator(validator: string, validator_file: string): Promise<CommitValidator> {
    if (validator_file !== '' && validator !== '') {
        throw Error("Please provide only 'validator' or 'validator_file'!")
    }
    if (validator_file === '' && validator === '') {
        throw Error("Please provide either 'validator' or 'validator_file'!")
    }

    if (validator_file !== '') {
        return new (await import_validator_cls("./validator.mjs"))()
    }
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
        if (res.commit !== undefined) {
            res.commit = commit
        }
        checks.push(validator.validate(commit))
    }
    return checks
}

// returns success
export async function download_validator_file(validator_file: string, access_token: string): Promise<boolean> {
    const octokit = github.getOctokit(access_token)
    const response = await octokit.rest.repos.getContent({
        path: validator_file,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: github.context.payload['head_commit']['id'],
    })
    if (response.status != 200) {
        core.setFailed(`failed to retrieve validator file '${response.url}'`)
        return false
    }
    if (!Array.isArray(response)) {
        core.setFailed(`given path '${response.url}' was a directory`)
        return false
    }
    if(!("content" in response.data)) {
        core.setFailed(`download of '${response.url}' failed`)
        return false
    }
    const buffer = Buffer.from(response.data.content, 'base64').toString('utf-8')
    fs.writeFile("./validator.mjs", buffer, err => { if (err) throw err })
    return true
}
