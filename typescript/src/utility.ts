import {CommitValidator, Result, Status} from './commit-validator'
import * as core from '@actions/core'
import {Commit} from './commit'
import {SimpleTag} from './validation'

export async function get_validator(validator: string, validator_file: string): Promise<CommitValidator> {
    if (validator_file !== '' && validator !== '') {
        throw Error("Please provide only 'validator' or 'validator_file'!")
    }
    if (validator_file === '' && validator === '') {
        throw Error("Please provide either 'validator' or 'validator_file'!")
    }

    if (validator_file !== '') {
        return import_validator_from_file(validator_file)
    }
    switch (validator) {
        case 'SimpleTag':
            return new SimpleTag()
        default:
            throw Error('Invalid validator name!')
    }
}

export async function import_validator_from_file(validator_file: string): Promise<CommitValidator> {
    const validation = await import(validator_file)
    return new validation.Validator()
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
        checks.push(validator.validate(commit))
    }
    return checks
}