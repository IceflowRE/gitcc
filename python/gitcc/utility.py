import importlib
from pathlib import Path
from typing import cast

from git import Repo
from git.objects import Commit
from gitcc.commit_validator import CommitValidator, Result, Status


def import_validator_from_file(validator_file: Path) -> CommitValidator:
    """
    Load a validator from given python file.
    """
    scope: dict = {}
    exec(compile(validator_file.read_text(), '<string>', 'exec'), scope)
    return scope['Validator']()


def import_validator(validator_module: str) -> CommitValidator:
    """
    Load a validator from given import path.
    """
    validator: list[str] = validator_module.rsplit('.', 1)
    return getattr(importlib.import_module(validator[0]), validator[1])()


def print_results(checks: list[Result], include_correct: bool = False) -> bool:
    """
    Return true when not one check was a failure.
    """
    all_ok: bool = True
    for check in checks:
        if check.status != Status.Ok or include_correct:
            print(check)
        all_ok = all_ok and check.status != Status.Failure
    return all_ok


def check_history(validator: CommitValidator, repo: Repo, exit_sha: str = "") -> list[Result]:
    """
    Check whole history.
    """
    checks: list[Result] = []
    for commit in repo.iter_commits():
        if commit.hexsha == exit_sha:
            break
        checks.append(validator.validate(commit))
    return checks


def check_branch(validator: CommitValidator, repo: Repo, source_branch: str, target_branch: str) -> list[Result]:
    """
    Check specific branch.
    """
    checks: list[Result] = []

    common_ancestors: list[Commit] = cast(list[Commit], repo.merge_base(source_branch, target_branch))
    if not common_ancestors:
        checks.append(Result(Status.Failure, "ERROR: No common ancestor found"))
        return checks

    exit_commit: str = common_ancestors[0].hexsha
    return check_history(validator, repo, exit_sha=exit_commit)
