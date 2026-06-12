/*
Used in GitHub Actions to validate commits.

Available in gitcc:

valid(commit?) => Result
invalid(message, commit?) => Result  
warning(message, commit?) => Result
splitCommitMessage(message) => [summary, description]
*/

import * as gitcc from "gitcc"

export function createValidator(_options) {
    const rx_parser = /^\[(.+?)\] (.+)$/
    const rx_category = /^(?:\*|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*(?:\|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*)*)$/
    const rx_description = /^[A-Z0-9]\S*(?:\s\S*)+[^.!?,\s]$/

    return {
        validate(commit) {
            const [summary, _description] = gitcc.splitCommitMessage(commit.message)
            const match = rx_parser.exec(summary)
            if (match === null) {
                return gitcc.invalid("Summary has invalid format. It should be '[<tag>] <Good Description>'")
            }
            if (!rx_category.test(match[1])) {
                return gitcc.invalid(
                    "Invalid category tag. It should be either a single '*' or completely lowercase letters or numbers, " +
                        "at least 2 characters long, other allowed characters are: '|', '-' and spaces."
                )
            }
            if (!rx_description.test(match[2])) {
                return gitcc.invalid(
                    "Invalid description. It should start with an uppercase letter or number, should be not to short and should not end with a punctuation."
                )
            }
            return gitcc.valid()
        }
    }
}
