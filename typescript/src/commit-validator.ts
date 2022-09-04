import {Commit} from './commit'

export enum Status {
    Failure = 'Failure',
    Warning = 'Warning',
    Ok = 'Correct'
}

export class Result {
    status: Status = Status.Failure
    message = ''
    commit: Commit | undefined = undefined

    constructor(status: Status, message = '', commit: Commit | undefined = undefined) {
        this.status = status
        this.message = message
        this.commit = commit
    }

    toString(colored = false): string {
        let msg: string = this.status.toString()
        if (colored) {
            switch (this.status) {
                case Status.Failure:
                    msg = `\u001b[0;31m${msg}\u001b[0m`
                    break
                case Status.Warning:
                    msg = `\u001b[0;33m${msg}\u001b[0m`
                    break
                case Status.Ok:
                    msg = `\u001b[0;32m${msg}\u001b[0m`
                    break
            }
        }
        if (this.commit !== undefined) {
            msg += ` | ${this.commit.hexsha} - ${this.commit.summary()}`
        }
        if (this.message !== '') {
            if (this.commit === undefined) {
                msg += ' |'
            }
            msg += `\n        : ${this.message}`
        }
        return msg
    }
}

export class CommitValidator {
    protected options: string[]
    constructor(options: string[]) {
        this.options = options
    }

    static split_message(message: string): [string, string] {
        const res: string[] = message.split('\n', 1)
        if (res.length === 1) {
            return [res[0], '']
        }
        return [res[0], res[1]]
    }

    validate(commit: Commit): Result {
        if (commit.message === undefined) {
            return new Result(Status.Failure, "commit message was empty.")
        }
        const check: Result = this.validate_message(...CommitValidator.split_message(commit.message))
        if (check.commit === undefined) {
            check.commit = commit
        }
        return check
    }

    validate_message(_summary: string, _description: string): Result {
        return new Result(Status.Ok, '')
    }
}
