import * as core from '@actions/core'
import * as github from '@actions/github'
import {get_commits} from './commit'
import {CommitValidator, Result} from './commit-validator'
import {
    check_commits,
    download_validator_file,
    get_shipped_validator,
    import_validator_cls,
    print_results
} from './utility'
import {GitHub} from "@actions/github/lib/utils"

async function run(): Promise<void> {
    try {
        core.info(JSON.stringify(github.context))

        const validator_file: string = core.getInput('validator_file')
        const validator_name: string = core.getInput('validator')
        const access_token: string = core.getInput('access_token')
        // just to be sure
        core.setSecret(access_token)

        if (validator_file !== '' && validator_name !== '') {
            core.setFailed("Please provide only 'validator' or 'validator_file'!")
            return
        }
        if (validator_file === '' && validator_name === '') {
            core.setFailed("Please provide either 'validator' or 'validator_file'!")
            return
        }
        const octokit: InstanceType<typeof GitHub> = github.getOctokit(access_token)

        let validator: CommitValidator
        if (validator_file !== "") {
            const [validator_url, mjs_file] = await download_validator_file(validator_file, octokit)
            if (mjs_file === "") {
                return
            }
            core.info(`Using validator from '${validator_url}'`)
            validator = new (await import_validator_cls(mjs_file))()
        } else {
            core.info(`Using shipped validator '${validator_name}'`)
            validator = await get_shipped_validator(validator_name)
        }

        const checks: Result[] = check_commits(await get_commits(octokit), validator)
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
