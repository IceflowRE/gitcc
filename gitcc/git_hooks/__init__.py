"""
Git hooks.
"""
from importlib import resources
from pathlib import Path

MOD_PATH: str = "gitcc.git_hooks"


def get_res_path(mod_path: str, file_name: str) -> Path:
    """
    Get resource path of python file.
    """
    with resources.path(mod_path, file_name) as res_p:
        return Path(res_p)


COMMIT_MSG_SUMMARY = get_res_path(MOD_PATH, 'commit_msg_summary.py')
