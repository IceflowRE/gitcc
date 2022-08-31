import {Commit} from './commit'

export enum Status {
    Failure = 'Failure',
    Warning = 'Warning',
    Ok = 'Correct'
}

export function split_message(message: string): [string, string] {
    const res: string[] = message.split('\n', 1)
    if (res.length === 1) {
        return [res[0], '']
    }
    return [res[0], res[1]]
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

    toString(): string {
        let msg: string = this.status.toString()
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
    validate(commit: Commit): Result {
        if (commit.message === undefined) {
            throw Error('commit message was empty.')
        }
        const res: Result = this.validate_message(...split_message(commit.message))
        res.commit = commit
        return res
    }

    validate_message(_summary: string, _description: string): Result {
        return new Result(Status.Ok, '')
    }
}