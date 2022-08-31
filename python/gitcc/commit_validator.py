from dataclasses import dataclass
from enum import Enum
from typing import Optional

from git.objects import Commit


class Status(str, Enum):
    """
    Status of a commit check.
    All none failures count as a success.
    """

    Failure = "Failure"
    Warning = "Warning"  # noqa: A003
    Ok = "Correct"


@dataclass
class Result:
    """
    Result of a commit check. Commit might be omitted when only a message is checked.
    """

    status: Status = Status.Failure
    message: str = ""
    commit: Optional[Commit] = None

    def __str__(self):  # noqa: D105
        msg: str = self.status.value
        if self.commit is not None:
            msg += f" | {self.commit.hexsha} - {str(self.commit.summary)}"
        if self.message != "":
            if self.commit is None:
                msg += " |"
            msg += f"\n        : {self.message}"
        return msg


def split_message(message: str) -> tuple[str, str]:
    """
    Split the commit message into summary and description.
    """
    res: list[str] = message.split('\n', 1)
    if len(res) == 1:
        return res[0], ""
    return res[0], res[1]


class CommitValidator:
    """
    Validator for commits.
    """

    def validate(self, commit: Commit) -> Result:
        """
        Validate a commit object.
        """
        res: Result = self.validate_message(*split_message(str(commit.message)))
        res.commit = commit
        return res

    def validate_message(self, summary: str, description: str) -> Result:
        """
        Check a commit message.
        """
        return Result(Status.Ok, "")
