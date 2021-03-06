import sys
from argparse import ArgumentParser
from pathlib import Path
from typing import Optional

from git import InvalidGitRepositoryError, Repo

from gitcc.git_hook import cmd_git_hook
from gitcc.utility import check_branch, check_commit, check_history, check_summary


def cmd_parser():
    """
    Command parser.
    """
    parser = ArgumentParser(prog="gitcc", description="")
    parser.add_argument('-v', '--version', action='version', version="gitcc 1.2.0")

    subparsers = parser.add_subparsers(dest='command', required=True)

    parser_summary = subparsers.add_parser('summary', help='check the given summary text')
    parser_summary.add_argument(dest='summary_text', metavar='text', help="text to check")

    parser_git_hook = subparsers.add_parser('git-hook', help='install or uninstall a git hook')
    parser_git_hook.add_argument(dest='git_hook_action', metavar='action', choices=['install', 'uninstall'], help="Install or uninstall.")
    parser_git_hook.add_argument(
        dest='git_hook_hooks', metavar='hooks', type=str, choices=['summary'], nargs='+', help="Choose available hooks."
    )
    parser_git_hook.add_argument(dest='repository', type=str, help='path to the repository')
    parser_git_hook.add_argument(
        '--force', dest='git_hook_force', action='store_true', default=False, help="Force install or uninstall, this might override existing files!"
    )

    parser_commit = subparsers.add_parser('commit', help='check current commit')
    parser_commit.add_argument(dest='repository', type=str, help='path to the repository')

    parser_history = subparsers.add_parser('history', help='check the current branch history')
    parser_history.add_argument(dest='repository', type=str, help='path to the repository')
    parser_history.add_argument('--sha', dest='sha', type=str, default="", help='check until this commit (exclusive)')
    parser_history.add_argument('--verbose', dest='verbose', action='store_true', help='print correct commits too')

    parser_branch = subparsers.add_parser(
        'branch', help='check the current branch with an other branch common ancestor. Is the same as gitcc history with git merge-base <source> <target>'
    )
    parser_branch.add_argument(dest='target_branch', type=str, metavar='target', help='target branch')
    parser_branch.add_argument(dest='repository', type=str, help='path to the repository')
    parser_branch.add_argument('--verbose', dest='verbose', action='store_true', help='print correct commits too')

    return parser


def main():  # noqa: D103, PLR0912, PLR1260
    args = cmd_parser().parse_args(sys.argv[1:])

    if args.command == 'summary':
        msg = check_summary(args.summary_text)
        if msg:
            print(msg)
            sys.exit(1)
        else:
            print("Commit summary has the correct format!")
            sys.exit(0)
    elif args.command == 'git-hook':
        sys.exit(cmd_git_hook(Path(args.repository), args.git_hook_action, args.git_hook_hooks, args.git_hook_force))

    repo: Optional[Repo] = None
    success: bool = False
    try:
        repo = Repo(args.repository)
    except InvalidGitRepositoryError:
        print("Given path is not a repository.")
        sys.exit(2)

    if args.command == 'commit':
        success, msg = check_commit(repo.head.commit)
        print(msg)
    else:
        msgs: list[str] = []
        if args.command == 'history':
            success, msgs = check_history(repo, args.sha, include_correct=args.verbose)
        elif args.command == 'branch':
            success, msgs = check_branch(repo, repo.head, args.target_branch, include_correct=args.verbose)
        else:
            print("Invalid command")
            sys.exit(1)
        if success and not msgs:
            print("All commits have the correct format!")
        else:
            print('\n'.join(msgs))

    if success:
        sys.exit(0)
    else:
        sys.exit(1)
