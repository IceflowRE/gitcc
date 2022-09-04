import sys
from argparse import ArgumentParser
from pathlib import Path
from typing import Optional

from git import InvalidGitRepositoryError, Repo

from gitcc.commit_validator import CommitValidator, Result, Status, split_message
from gitcc.git_hook import cmd_git_hook
from gitcc.utility import check_branch, check_history, import_validator, import_validator_from_file, print_results


def cmd_parser():
    """
    Command parser.
    """
    parser = ArgumentParser(prog="gitcc", description="")
    parser.add_argument('-v', '--version', action='version', version="gitcc 2.0.0")
    parser_validator = parser.add_mutually_exclusive_group()
    parser_validator.add_argument('--validator', dest='validator', type=str, default="",
                                  help='Python import path to Validator class.')
    parser_validator.add_argument('--validator-file', dest='validator_file', type=Path, default=None,
                                  help='Path to file with Validator.')

    subparsers = parser.add_subparsers(dest='command', required=True)

    parser_summary = subparsers.add_parser('message', help='check the given message text')
    parser_summary.add_argument('--file', dest='message_file', action='store_true', default=False,
                                help='Text will be a file to be interpret as a message.')
    parser_summary.add_argument(dest='message_text', metavar='text', help="text to check")

    parser_git_hook = subparsers.add_parser('git-hook', help='install or uninstall a git hook')
    parser_git_hook.add_argument(dest='git_hook_action', metavar='action', choices=['install', 'remove'],
                                 help="Install or uninstall.")
    parser_git_hook.add_argument(
        dest='git_hook_hooks', metavar='hooks', type=str, choices=['message'], nargs='+', help="Choose available hooks."
    )
    parser_git_hook.add_argument(dest='repository', type=str, help='path to the repository')
    parser_git_hook.add_argument(
        '--force', dest='git_hook_force', action='store_true', default=False,
        help="Force install, this might override existing files!"
    )

    parser_commit = subparsers.add_parser('commit', help='check current commit')
    parser_commit.add_argument(dest='repository', type=str, help='path to the repository')

    parser_history = subparsers.add_parser('history', help='check the current branch history')
    parser_history.add_argument(dest='repository', type=str, help='path to the repository')
    parser_history.add_argument('--sha', dest='sha', type=str, default="", help='check until this commit (exclusive)')
    parser_history.add_argument('--verbose', dest='verbose', action='store_true', default=False,
                                help='print correct commits too')

    parser_branch = subparsers.add_parser(
        'branch',
        help='check the current branch with an other branch common ancestor. Is the same as gitcc history with git merge-base <source> <target>'
    )
    parser_branch.add_argument(dest='target_branch', type=str, metavar='target', help='target branch')
    parser_branch.add_argument(dest='repository', type=str, help='path to the repository')
    parser_branch.add_argument('--verbose', dest='verbose', action='store_true', default=False,
                               help='print correct commits too')

    return parser


def main():  # noqa: D103, PLR0912, PLR1260
    args = cmd_parser().parse_args(sys.argv[1:])

    if args.validator != "":
        validator = import_validator(args.validator)
    elif args.validator_file is not None:
        validator = import_validator_from_file(args.validator_file)
    else:
        validator = CommitValidator()

    if args.command == 'message':
        if args.message_file:
            message: str = Path(args.message_text).read_text()
        else:
            message: str = args.message_text
        check: Result = validator.validate_message(*split_message(message))
        print(check)
        if check.status == Status.Ok:
            sys.exit(0)
        else:
            sys.exit(1)
    elif args.command == 'git-hook':
        sys.exit(cmd_git_hook(Path(args.repository), args.git_hook_action, args.git_hook_hooks, args.git_hook_force,
                              args.validator, args.validator_file))

    repo: Optional[Repo] = None
    try:
        repo = Repo(args.repository)
    except InvalidGitRepositoryError:
        print("Given path is not a repository.")
        sys.exit(1)

    checks: list[Result] = []
    if args.command == 'commit':
        checks = [validator.validate(repo.head.commit)]
        args.verbose = True
    elif args.command == 'history':
        checks = check_history(validator, repo, args.sha)
    elif args.command == 'branch':
        checks = check_branch(validator, repo, str(repo.head), args.target_branch)
    else:
        print("Invalid command")
        sys.exit(1)

    all_ok: bool = print_results(checks, args.verbose)
    if all_ok:
        if args.command != 'commit':
            print("All commits have the correct format!")
        sys.exit(0)
    else:
        sys.exit(1)
