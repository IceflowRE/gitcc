import * as github from '@actions/github'
import {GitHub} from "@actions/github/lib/utils"

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

    constructor(commit: object, sha = "") {
        type key = keyof typeof commit
        this.author = new User(commit['author' as key])
        this.committer = new User(commit['committer' as key])
        this.distinct = commit['distinct' as key] ?? false
        this.hexsha = commit['id' as key] ?? sha
        const timestamp_raw = commit['timestamp' as key]
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

export async function get_commits(octokit: InstanceType<typeof GitHub>): Promise<Commit[]> {
    const commits: Commit[] = []
    switch (github.context.eventName) {
        case 'pull_request': {
            const pr_number = github.context.payload.pull_request?.number
            if (pr_number === undefined) {
                return []
            }

            const response = await octokit.rest.pulls.listCommits({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: pr_number,
            })
            if (response.status !== 200) {
                return []
            }
            for (const raw_commit of response.data) {
                commits.push(new Commit(raw_commit.commit, raw_commit.sha))
            }
            break
        }
        case 'push':
        default: {
            if ('commits' in github.context.payload) {
                for (const commit of github.context.payload['commits']) {
                    commits.push(new Commit(commit))
                }
            }
        }
    }
    return commits
}
