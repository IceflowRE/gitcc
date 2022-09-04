********************
GitCC GitHub Actions
********************

|maintained| |programming language| |license|

----

GitCC checks commit messages for certain rules.

----

Usage
=====

.. code-block:: yml

    - uses: IceflowRE/gitcc@v2
      with:
        # GitHub private access token default: {{ $github.token }}.
        access_token: ''
        # Filepath to an own validator. On how to write your own, see below.
        validator_file: ''
        # Name of an validator which is shipped with gitcc. Valid names: SimpleTag
        validator: ''
        # Each line is passed as an entry of a list to the validator.
        options: ''

Shipped validators
------------------

SimpleTag
    Format: ``[<tag>] <Good Description>`` (e.g. ``[ci] Fix testing suite installation``)
RegEx
    Pass two lines to parameter ``options``, first line is a regex for summary, second line is description.
    Using ``>any<`` means it accepts anything.

Custom validators
-----------------

Create somewhere in your repository a file (e.g. ``validator.mjs``) and use the path in ``validator_file``.

Your validator will inherit from `CommitValidator <./src/commit-validator.ts#L35>`__. Only implement the function you need, so it wont override the default behavior.

You have to always return a `Result <./src/commmit-validator.ts#L9>`__. Only ``Status.Failure`` will result into an CI error.

`CommitValidator <./src/commit-validator.ts#L35>`__ provides the following constructor/functions.

- ``constructor(options: string[])``
    Get options passed to the GitHub workflow

- ``split_message(message: string): [string, string]``
    Will split the message into summary and description.

- ``validate(commit: Commit): Result``
    Will call ``validate_message`` by default.

- ``validate_message(summary: string, description: string): Result``
    For simple use cases when only the summary and description text has to be checked.

Look here for the `Reference`_ and an example `here <./src/example/simpleTag.mjs>`__.

Template
********

.. code-block:: javascript

    let Commit
    let CommitValidator
    let Result
    let Status

    export function import_types(commitValidatorCls, commitCls, resultCls, statusCls) {
        console.log(resultCls)
        CommitValidator = commitValidatorCls
        Commit = commitCls
        Result = resultCls
        Status = statusCls
    }

    export function createValidator() {
        return class Validator extends CommitValidator {
            // PLACE HERE YOUR CODE
        }
    }

Reference
---------

- `Commit <./src/commit.ts#L16>`__
- `CommitValidator <./src/commit-validator.ts#L35>`__
- `Result <./src/commmit-validator.ts#L9>`__
- `Status <./src/commmit-validator.ts#L3>`__

Credits
=======

- Developer
    - `Iceflower S <https://github.com/IceflowRE>`__
        - iceflower@gmx.de

License
=======

Copyright 2021-present Iceflower S (iceflower@gmx.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

.. Badges.

.. |maintained| image:: https://img.shields.io/badge/maintained-yes-brightgreen.svg

.. |programming language| image:: https://img.shields.io/badge/language-Typescript-orange.svg

.. |license| image:: https://img.shields.io/badge/License-MIT-blue.svg
   :target: https://github.com/IceflowRE/gitcc/blob/main/LICENSE.rst
