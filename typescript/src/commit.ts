export class User {
    email: string | undefined = undefined
    name: string | undefined = undefined
    username: string | undefined = undefined

    constructor(data: object) {
        type key = keyof typeof data
        this.email = data['email' as key]
        this.name = data['name' as key]
        this.username = data['username' as key]
    }
}

export class Commit {
    author: User | undefined = undefined
    committer: User | undefined = undefined
    distinct: boolean | undefined = undefined
    hexsha: string | undefined = undefined
    timestamp: Date | undefined = undefined
    message: string | undefined = undefined

    constructor(commit: object, sha = "", timestamp = "") {
        type key = keyof typeof commit
        this.author = new User(commit['author' as key])
        this.committer = new User(commit['committer' as key])
        this.distinct = commit['distinct' as key] ?? false
        this.hexsha = commit['id' as key] ?? sha
        const timestamp_raw = commit['timestamp' as key] ?? timestamp
        if (timestamp_raw !== undefined) {
            this.timestamp = new Date(timestamp_raw)
        }
        this.message = commit['message' as key]
    }

    // return empty string if message is undefined
    summary(): string {
        if (this.message === undefined) {
            return ''
        }
        return this.message.split('\n', 1)[0]
    }
}
