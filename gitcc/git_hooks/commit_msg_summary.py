#!/usr/bin/env python

import sys
from pathlib import Path

from gitcc import utility

if __name__ == '__main__':
    commit_msg_file: Path = Path(sys.argv[1])
    with commit_msg_file.open('r', encoding='utf-8') as reader:
        commit_summary = reader.read().split('\n')[0]
    res: str = utility.check_summary(commit_summary)
    if not res:
        sys.exit(0)
    print(res)
    sys.exit(1)
