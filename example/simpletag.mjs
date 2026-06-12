/*
Used in GitHub Actions to validate commits.

Available globals:

valid(commit?) => Result
invalid(message, commit?) => Result  
warning(message, commit?) => Result
splitCommitMessage(message) => [summary, description]
*/

/* global splitCommitMessage, invalid, valid, warning */

// disable unused linting warning, remove in your code
const _ = warning

export function createValidator(_options) {
    const rx_parser = /^\[(.+?)\] (.+)$/
    const rx_category =
        /^(?:\*|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*(?:\|(?:[a-z0-9]{2,}|[a-z0-9][ -][a-z0-9]+)(?:[ -][a-z0-9]+)*)*)$/
    const rx_description = /^[A-Z0-9]\S*(?:\s\S*)+[^.!?,\s]$/

    return {
        validate(commit) {
            const [summary, _description] = splitCommitMessage(commit.message)
            const match = rx_parser.exec(summary)
            if (match === null) {
                return invalid("Summary has invalid format. It should be '[<tag>] <Good Description>'")
            }
            if (!rx_category.test(match[1])) {
                return invalid(
                    "Invalid category tag. It should be either a single '*' or completely lowercase letters or numbers, at least 2 characters long, other allowed characters are: '|', '-' and spaces."
                )
            }
            if (!rx_description.test(match[2])) {
                return invalid(
                    "Invalid description. It should start with an uppercase letter or number, should be not to short and should not end with a punctuation."
                )
            }
            return valid()
        }
    }
}
