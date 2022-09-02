import * as github from '@actions/github'
import {GitHub} from "@actions/github/lib/utils"
import * as core from '@actions/core'

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

    constructor(commit: object) {
        type key = keyof typeof commit
        this.author = new User(commit['author' as key])
        this.committer = new User(commit['committer' as key])
        this.distinct = commit['distinct' as key] ?? false
        this.hexsha = commit['id' as key]
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
    let commits_raw = []
    switch (github.context.eventName) {
        case 'push':
            commits_raw = github.context.payload['commits']
            break
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
            commits_raw = response.data
            core.info(response.url)
            core.info(response.data.toString())
            break
        }
        default:
            if ('commits' in github.context.payload) {
                commits_raw = github.context.payload['commits']
            }
    }
    const commits: Commit[] = []
    for (const commit of commits_raw) {
        commits.push(new Commit(commit))
    }
    return commits
}
