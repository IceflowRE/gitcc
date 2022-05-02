import re
from typing import Optional, cast

from git import Repo
from git.objects import Commit


class RxSummary:
    """
    Regex check for the commit summary.
    """

    rx_parser: re.Pattern = re.compile(r"\[(.*)] (.*)")
    rx_category: re.Pattern = re.compile(r"\*|(?:[a-z0-9]{2,}[\s|-]?)+")
    rx_description: re.Pattern = re.compile(r"[A-Z0-9].+[^.!?,\s]")

    def __init__(self, summary: str):
        self.category_tag: str = ""
        self.description_text: str = ""

        match: Optional[re.Match] = self.rx_parser.fullmatch(summary)
        if match is None:
            return
        self.category_tag = match.group(1)
        self.description_text = match.group(2)

    def valid_format(self) -> bool:
        """
        Has summary valid format.
        """
        return self.category_tag != "" and self.description_text != ""  # noqa: PLC1901

    def valid_category_tag(self) -> bool:
        """
        Has valid summary tag.
        """
        return self.rx_category.fullmatch(self.category_tag) is not None

    def valid_description(self) -> bool:
        """
        Has valid summary description.
        """
        return self.rx_description.fullmatch(self.description_text) is not None


def check_summary(summary: str) -> str:
    """
    Check summary text.
    """
    check: RxSummary = RxSummary(summary)
    if not check.valid_format():
        return "Invalid format. It should be '[<tag>] <Good Description>'"

    if not check.valid_category_tag():
        return (
            "Invalid category tag. It should be either a single '*' or completely lowercase " +
            "letters or numbers, at least 2 characters long, other allowed characters are: '|', '-' and spaces."
        )

    if not check.valid_description():
        return (
            "Invalid description. It should start with an uppercase letter or number, " +
            "should be not to short and should not end with a punctuation."
        )

    return ""


def check_commit(commit: Commit) -> tuple[bool, str]:
    """
    Check specific commit.
    """
    msg: str = check_summary(str(commit.summary))
    if not msg:
        return True, f"Correct | {commit.hexsha} - {str(commit.summary)}"
    return False, f"Failure | { commit.hexsha} - {str(commit.summary)}\n    Summary: {msg}"


def check_history(repo: Repo, exit_sha: str = "", include_correct: bool = False) -> tuple[bool, list[str]]:
    """
    Check whole history.
    """
    success: bool = True
    msgs: list[str] = []
    for commit in repo.iter_commits():
        if commit.hexsha == exit_sha:
            break
        res, msg = check_commit(commit)
        if not res or include_correct:
            msgs.append(msg)
        success = success and res
    return success, msgs


def check_branch(repo: Repo, source_branch: str, target_branch: str, include_correct: bool = False) -> tuple[bool, list[str]]:
    """
    Check specific branch.
    """
    error_msgs: list[str] = []

    common_ancestors: list[Commit] = cast(list[Commit], repo.merge_base(source_branch, target_branch))
    if not common_ancestors:
        error_msgs.append("ERROR: No common ancestor found")
        return False, error_msgs

    start_commit: str = common_ancestors[0].hexsha
    return check_history(repo, exit_sha=start_commit, include_correct=include_correct)
