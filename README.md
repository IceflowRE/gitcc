# GitCC GitHub Action

![maintained](https://img.shields.io/badge/maintained-yes-brightgreen.svg)
![Programming Language](https://img.shields.io/badge/language-Typescript-orange.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/IceflowRE/gitcc/blob/main/LICENSE.md)

[![GitHub Marketplace](https://img.shields.io/badge/GitHub_Marketplace-grey.svg?logo=github-actions)](https://github.com/marketplace/actions/git-commit-check)

GitCC checks commit messages for certain rules.

## Usage

```yaml
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
```

## Shipped validators

### SimpleTag

Format: `[<tag>] <Good Description>` (e.g. `[ci] Fix testing suite installation`)

### RegEx

Pass two lines to parameter `options`, first line is a regex for summary, second line is description.
Using `>any<` means it accepts anything.

```yaml
        - uses: IceflowRE/gitcc@v2
          with:
            validator: 'RegEx'
            options: |
              >any<
              >any<
```

## Custom validators

Create somewhere in your repository a file (e.g. `validator.mjs`) and use the path in `validator_file`.

Your validator will inherit from [CommitValidator](https://www.google.com/search?q=./src/commit-validator.ts%23L48). Only implement the function you need, so it won't override the default behavior.

You have to always return a [Result](https://www.google.com/search?q=./src/commmit-validator.ts%23L48). Only `Status.Failure` will result into an CI error.

[CommitValidator](https://www.google.com/search?q=./src/commit-validator.ts%23L48) provides the following constructor/functions:

* **`constructor(options: string[])`**
    Options passed to GitHub workflow.
* **`split_message(message: string): [string, string]`**
    Will split the message into summary and description.
* **`validate(commit: Commit): Result`**
    Will call `validate_message` by default.
* **`validate_message(summary: string, description: string): Result`**
    For simple use cases when only the summary and description text has to be checked.

Look here for the [Reference](https://www.google.com/search?q=%23reference) and a basic example [here](https://www.google.com/search?q=./example/simpleTag.mjs).

### Template

```javascript
    /*
    Used in GitHub Actions for validate commits.
     */

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
            // PLACE YOUR CODE HERE
        }
    }
```

## Reference

* [Commit](https://www.google.com/search?q=./src/commit.ts%23L14)
* [CommitValidator](https://www.google.com/search?q=./src/commit-validator.ts%23L48)
* [Result](https://www.google.com/search?q=./src/commit-validator.ts%23L9)
* [Status](https://www.google.com/search?q=./src/commit-validator.ts%23L3)

## Changelog

### 2.1.0

* Running on Node 24 in GitHub Actions.

## License

Copyright 2021-present Iceflower S (iceflower@gmx.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
