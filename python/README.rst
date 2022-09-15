*****
GitCC
*****
|maintained| |programming language| |license|

|github actions| |requirements|

|pypi|

----

GitCC checks commit messages for certain rules.

To use as a GitHub Actions refer to the ``commit-check-python`` section in `example <../.github/workflows/commit_check.yml>`__.

To expand gitcc to apply your own rules inherit from `gitcc.commit_validator.Validator <./gitcc/commit_validator.py>`__.
If you use the ``--validator-file`` argument the Validator class in that file must be named ``Validator``.

Shipped validators
------------------

gitcc.validation.SimpleTag
    Format: ``[<tag>] <Good Description>`` (e.g. ``[ci] Fix testing suite installation``)

----

gitcc [\-h] [\-v] [\-validator | \-validator-file] {message, git-hook, commit, history, branch}

**validator** <Python import path>
        Python import path to Validator class.

    ..

**validator-file** <file path>
        Path to file with Validator..

    ..

----

**message** <text>
        check the given message

    **text**
            text to check

        ..

----

*git-hook* [--force] <action> <hooks> [<hooks> ...] <repository>
        install or uninstall a git hook

    **<action>**
            Install or uninstall. [install, uninstall]

        ..

    **<hooks>**
            Choose available hooks. [message]

        ..

    **<repository>**
            path to the repository

        ..

    [options]
        **--force**
                Force install or uninstall, this might override existing files!

            ..

----

**commit** <repository>
        check current commit

    **<repository>**
            path to the repository

        ..

----

**history** [--sha <SHA>] [--verbose] <repository>
            check the current branch history

    **<repository>**
            path to the repository

        ..

    [options]
        **--sha** <SHA>
                check until this commit (exclusive)

            ..

        **--verbose**
                print correct commits too

            ..

----

**branch** [--verbose] <target> <repository>
        check the current branch with an other branch common ancestor. Is the same as gitcc history with git merge-base <source> <target>

    ..

    **<target>**
            target branch

        ..

    **<repository>**
            path to the repository

        ..

    [options]
        **--verbose**
                print correct commits too

            ..

----

**-h**, **--help**
        show this help message and exit

    ..

**-v**, **--version**
        show program's version number and exit

    ..

----

Examples
--------

.. code-block:: shell

    gitcc --validator gitcc.validation.SimpleTag message "Is this a valid message?"

Web
===

https://github.com/IceflowRE/gitcc

Credits
=======

- Developer
    - `Iceflower S <https://github.com/IceflowRE>`__
        - iceflower@gmx.de

Third Party
-----------

GitPython
    - Michael Trier and contributors
    - https://github.com/gitpython-developers/GitPython
    - `BSD-3-Clause <https://github.com/gitpython-developers/GitPython/blob/main/LICENSE>`__

License
-------

Copyright 2021-present Iceflower S (iceflower@gmx.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

.. Badges.

.. |maintained| image:: https://img.shields.io/badge/maintained-yes-brightgreen.svg

.. |programming language| image:: https://img.shields.io/badge/language-Python_3.10-orange.svg
   :target: https://www.python.org/

.. |license| image:: https://img.shields.io/badge/License-MIT-blue.svg
   :target: https://github.com/IceflowRE/gitcc/blob/main/LICENSE.rst

.. |github actions| image:: https://github.com/IceflowRE/gitcc/actions/workflows/build.yml/badge.svg
   :target: https://github.com/IceflowRE/gitcc/actions

.. |pypi| image:: https://img.shields.io/pypi/v/gitcc.svg
   :target: https://pypi.org/project/gitcc/

.. |requirements| image:: https://requires.io/github/IceflowRE/unidown/requirements.svg?branch=main
   :target: https://requires.io/github/IceflowRE/gitcc/requirements/?branch=main
