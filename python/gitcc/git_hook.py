from pathlib import Path
from typing import Callable, Optional


def install_message_git_hook(project_dir: Path, force: bool = False, validator: Optional[str] = None,
                             validator_file: Optional[Path] = None) -> None:
    """
    Install git summary hook.

    :param force: override existing files
    :param project_dir: must contain a .git directory.
    :param validator: import path to a Validator
    :param validator_file: python file with a 'Validator' class
    :raises FileExistsError: A hook already exist.
    """
    hook_file: Path = project_dir.joinpath(".git/hooks/commit-msg")
    if not force and hook_file.exists():
        raise FileExistsError("A commit message hook already exist!")
    hook: str = '#!/usr/bin/env bash\ngitcc'
    if validator is not None:
        hook += f" --validator {validator}"
    elif validator_file is not None:
        hook += f" --validator_file {validator_file}"
    hook += ' message --file "$1"'
    hook_file.write_text(hook)


def remove_message_git_hook(project_dir: Path) -> None:
    """
    Remove git summary hook.

    :param project_dir: must contain a .git directory.
    :raises RuntimeError: Cannot remove the hook.
    """
    project_dir.joinpath(".git/hooks/commit-msg").unlink(missing_ok=True)


GIT_HOOKS: dict[str, dict[str, Callable]] = {  # noqa: PLR6101, WPS407
    'install': {
        'message': install_message_git_hook,
    },
    'remove': {
        'message': remove_message_git_hook,
    }
}


def cmd_git_hook(repo: Path, action: str, hooks: list[str], force: bool = False, validator: Optional[str] = None,
                 validator_file: Optional[Path] = None) -> int:
    """
    Execute git hooks.

    :param repo: repository path
    :param action: action to execute
    :param hooks: git hooks
    :param force: force action
    :param validator: import path to a Validator
    :param validator_file: python file with a 'Validator' class
    :return: exit code
    """
    exit_code: int = 0
    for hook in hooks:
        try:
            GIT_HOOKS[action][hook](repo, force, validator, validator_file)
        except (FileExistsError, RuntimeError) as ex:
            print(ex)
            exit_code = 1
    return exit_code
