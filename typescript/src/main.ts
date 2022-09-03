import * as core from '@actions/core'
import * as github from '@actions/github'
import {CommitValidator, Result} from './commit-validator'
import * as utils from './utility'
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
            core.info("validator path")
            const [validator_url, mjs_file] = await utils.download_validator_file(validator_file, octokit)
            core.info(validator_url)
            core.info(mjs_file)
            if (mjs_file === "") {
                return
            }
            core.info(`Using validator from '${validator_url}'`)
            validator = new (await utils.import_validator_cls(mjs_file))()
        } else {
            core.info(`Using shipped validator '${validator_name}'`)
            validator = await utils.get_shipped_validator(validator_name)
        }

        const commits = await utils.get_commits(octokit)
        if (commits.length === 0) {
            core.setFailed("No commits were found!")
            return
        }
        const checks: Result[] = utils.check_commits(await utils.get_commits(octokit), validator)
        utils.print_results(checks)
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
