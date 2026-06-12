import { Validator } from "@/validator"
import { Commit, splitCommitMessage } from "@/commit"
import { Result, valid, invalid } from "@/result"

export function getValidatorByName(validator: string, options: Record<string, string>): Validator {
    switch (validator.toLowerCase()) {
        case "simpletag":
            return new SimpleTagValidator(options)
        case "regex":
            return new RegExValidator(options)
        default:
            throw Error("Invalid validator name!")
    }
}

export class SimpleTagValidator implements Validator {
    private static readonly rx_parser: RegExp = /^\[(.+?)\] (.+)$/
    private static readonly rx_category: RegExp =
        /^(?:\*|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*(?:\|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*)*)$/
    private static readonly rx_description: RegExp = /^[A-Z0-9]\S*(?:\s\S*)+[^.!?,\s]$/

    constructor(_options: Record<string, string>) {}

    validate(commit: Commit): Result {
        if (!commit.message) {
            return invalid("Commit message was undefined.")
        }
        const [summary, _]: [string, string] = splitCommitMessage(commit.message)

        const match = SimpleTagValidator.rx_parser.exec(summary)
        if (match === null) {
            return invalid("Summary has invalid format. Expected: '[<tag>] <Description>'")
        }
        if (!SimpleTagValidator.rx_category.test(match[1])) {
            return invalid(
                "Category tag must be a single '*' or lowercase letters/numbers (at least 2 characters), optionally separated by '|', '-' or spaces."
            )
        }
        if (!SimpleTagValidator.rx_description.test(match[2])) {
            return invalid(
                "Description must start with an uppercase letter or number, be sufficiently long and not end with punctuation."
            )
        }
        return valid()
    }
}

export class RegExValidator implements Validator {
    private readonly rxSummary: RegExp = new RegExp("")
    private readonly rxDescription: RegExp = new RegExp("")

    constructor(options: Record<string, string>) {
        this.rxSummary = new RegExp(options["summary"] ?? "")
        this.rxDescription = new RegExp(options["description"] ?? "")
    }

    validate(commit: Commit): Result {
        if (!commit.message) {
            return invalid("Commit message was undefined.")
        }
        const [summary, description]: [string, string] = splitCommitMessage(commit.message)

        if (!this.rxSummary.test(summary)) {
            return invalid(`Summary does not match pattern '${this.rxSummary.source}'`)
        }
        if (description && !this.rxDescription.test(description)) {
            return invalid(`Description does not match pattern '${this.rxDescription.source}'`)
        }
        return valid()
    }
}
