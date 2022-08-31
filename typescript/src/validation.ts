import {CommitValidator, Result, Status} from './commit-validator'

export class SimpleTag extends CommitValidator {
    private static readonly rx_parser: RegExp = new RegExp('^\\[(.*)] (.*)$')
    private static readonly rx_category: RegExp = new RegExp('^\\*|(?:[a-z0-9]{2,}[ |-]?)+$')
    private static readonly rx_description: RegExp = new RegExp('^[A-Z0-9]\\S*(?:\\s\\S*)+[^.!?,\\s]$')

    validate_message(summary: string, _description: string): Result {
        const match = SimpleTag.rx_parser.exec(summary)
        if (match === null) {
            return new Result(
                Status.Failure,
                'Summary has invalid format. It should be \'[<tag>] <Good Description>\''
            )
        }
        if (!SimpleTag.rx_category.test(match[1])) {
            return new Result(
                Status.Failure,
                "Invalid category tag. It should be either a single '*' or completely lowercase " +
                "letters or numbers, at least 2 characters long, other allowed characters are: '|', '-' and spaces."
            )
        }
        if (!SimpleTag.rx_description.test(match[2])) {
            return new Result(
                Status.Failure,
                'Invalid description. It should start with an uppercase letter or number, ' +
                'should be not to short and should not end with a punctuation.'
            )
        }
        return new Result(Status.Ok)
    }
}
