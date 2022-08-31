import * as core from '@actions/core'
import * as github from '@actions/github'
import {get_commits} from './commit'
import {CommitValidator, Result} from './commit-validator'
import {check_commits, get_validator, print_results} from './utility'

async function run(): Promise<void> {
    try {
        core.info(JSON.stringify(github.context.payload['commits']))
        core.info(JSON.stringify(github.context.payload['head_commit']))
        core.info(JSON.stringify(github.context.eventName))

        const validator_file: string = core.getInput('validator_file')
        const validator_name: string = core.getInput('validator')
        const validator: CommitValidator = await get_validator(validator_name, validator_file)

        const checks: Result[] = check_commits(get_commits(), validator)
        const all_ok: boolean = print_results(checks)
        if (all_ok) {
            core.info("All commits have the correct format!")
        } else {
            core.setFailed("Not all commits were correct!")
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()