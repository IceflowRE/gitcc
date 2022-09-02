import * as core from '@actions/core'
import * as github from '@actions/github'
import {get_commits} from './commit'
import {CommitValidator, Result} from './commit-validator'
import {check_commits, get_validator, download_validator_file, print_results} from './utility'

async function run(): Promise<void> {
    try {
        core.info(JSON.stringify(github.context))
        core.info(JSON.stringify(github.context.repo.owner))
        core.info(JSON.stringify(github.context.repo.repo))
        core.info(JSON.stringify(github.context.payload['head_commit']['id']))

        const validator_file: string = core.getInput('validator_file')
        const validator_name: string = core.getInput('validator')
        const access_token: string = core.getInput('access_token')
        // just to be sure
        core.setSecret(access_token)

        if (validator_file !== "") {
            if (!await download_validator_file(validator_file, access_token)) {
                return
            }
        }
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
