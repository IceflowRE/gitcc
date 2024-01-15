import {Commit} from "./commit"
import {CommitValidator, Result, Status} from "./commit-validator"
import * as validation from "./validation"

export async function get_shipped_validator_cls(validator: string): Promise<typeof CommitValidator> {
    switch (validator.toLowerCase()) {
        case "simpletag":
            return validation.SimpleTag
        case "regex":
            return validation.RegEx
        default:
            throw Error("Invalid validator name!")
    }
}

const _importDynamic = new Function("modulePath", "return import(modulePath)")

export async function import_validator_cls(validator_file: string): Promise<typeof CommitValidator> {
    const validation_mod = await _importDynamic(validator_file)
    validation_mod.import_types(CommitValidator, Commit, Result, Status)
    return validation_mod.createValidator()
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
