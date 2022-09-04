import re
from typing import Optional

from gitcc.commit_validator import CommitValidator, Result, Status


class SimpleTag(CommitValidator):
    """
    Validation based on pattern: '[<tag>] <Good Description>'.
    """

    rx_parser: re.Pattern = re.compile(r"\[(.*)] (.*)")
    rx_category: re.Pattern = re.compile(r"\*|(?:[a-z0-9]{2,}[\s|-]?)+")
    rx_description: re.Pattern = re.compile(r"[A-Z0-9]\S*(?:\s\S*)+[^.!?,\s]")

    def validate_message(self, summary: str, description: str) -> Result:
        """
        Summary parameter overrides the commit summary.
        """
        match: Optional[re.Match] = self.rx_parser.fullmatch(summary)
        if match is None:
            return Result(Status.Failure, "Summary has invalid format. It should be '[<tag>] <Good Description>'")
        if self.rx_category.fullmatch(match.group(1)) is None:
            return Result(
                Status.Failure,
                "Invalid category tag. It should be either a single '*' or completely lowercase " +
                "letters or numbers, at least 2 characters long, other allowed characters are: '|', '-' and spaces.",
            )

        if self.rx_description.fullmatch(match.group(2)) is None:
            return Result(
                Status.Failure,
                "Invalid description. It should start with an uppercase letter or number, " +
                "should be not to short and should not end with a punctuation."
            )
        return Result(Status.Ok)


class Regex(CommitValidator):
    """
    Regex validator.
    """

    def __init__(self, summary_pattern: Optional[str], description_pattern: Optional[str]):
        self.summary_pattern: Optional[re.Pattern] = None
        if summary_pattern is not None:
            self.summary_pattern = re.compile(summary_pattern)
        self.description_pattern: Optional[re.Pattern] = None
        if description_pattern is not None:
            self.description_pattern = re.compile(description_pattern)

    def validate_message(self, summary: str, description: str) -> Result:
        """
        Summary parameter overrides the commit summary.
        """
        match: Optional[re.Match] = None
        if self.summary_pattern is not None:
            match = self.summary_pattern.fullmatch(summary)
            if match is None:
                return Result(Status.Failure, f"Summary does not match the pattern '{self.summary_pattern.pattern}'")
        if self.description_pattern is not None:
            match = self.description_pattern.fullmatch(description)
            if match is None:
                return Result(Status.Failure, f"Description does not match the pattern '{self.description_pattern.pattern}'")
        return Result(Status.Ok)
