// loader must be the first import as it handles the module loading of custom validators
import "@/loader"

import * as core from "@actions/core"
import { Client, getClient } from "@/platform/common"
import { importValidator } from "@/loader"
import { Result } from "@/result"
import { checkCommits, parseValidatorOptions, printResults, Validator } from "@/validator"
import { getValidatorByName } from "@/validators"

async function run(): Promise<void> {
    try {
        const validatorFile: string = core.getInput("validator_file")
        const validatorName: string = core.getInput("validator")

        if (validatorFile !== "" && validatorName !== "") {
            core.setFailed("Please provide only 'validator' or 'validator_file'!")
            return
        }
        if (validatorFile === "" && validatorName === "") {
            core.setFailed("Please provide either 'validator' or 'validator_file'!")
            return
        }

        const client: Client = getClient()

        const valOptions: Record<string, string> = parseValidatorOptions(core.getMultilineInput("options"))

        let validator: Validator
        if (validatorFile !== "") {
            const [validatorUrl, mjsFile] = await client.downloadValidatorFile(validatorFile)
            if (mjsFile === "") {
                return
            }
            core.info(`Using validator from '${validatorUrl}'`)
            validator = await importValidator(mjsFile, valOptions)
        } else {
            core.info(`Using shipped validator '${validatorName}'`)
            validator = getValidatorByName(validatorName, valOptions)
        }

        const commits = await client.getCommits()
        if (commits.length === 0) {
            core.setFailed("No commits were found!")
            return
        }
        const checks: Result[] = checkCommits(validator, commits)
        printResults(checks)
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
