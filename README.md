# GitCC GitHub Action

![maintained](https://img.shields.io/badge/maintained-yes-brightgreen.svg)
![Programming Language](https://img.shields.io/badge/language-Typescript-orange.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/IceflowRE/gitcc/blob/main/LICENSE.md)

[![GitHub Marketplace](https://img.shields.io/badge/GitHub_Marketplace-grey.svg?logo=github-actions)](https://github.com/marketplace/actions/git-commit-check)

GitCC checks commit messages for certain rules. Available for [GitHub Actions](https://github.com/features/actions) and [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/overview).

A CLI version is also available at [GitHub](https://github.com/IceflowRE/gitcc-cli).

## Usage

On Forgejo: `https://github.com/IceflowRE/gitcc@v3.0.0`  
On GitHub: `IceflowRE/gitcc@v3.0.0`

> [!note]
> Unmutable release are used. There is no rolling tag like `latest` or `v3` because of the security implications.

Minimal example:

```yaml
- uses: IceflowRE/gitcc@v3.0.0
  with:
      validator: "regex"
      options: |
          summary: ".*"
          description: ".*"
```

All options:

```yaml
- uses: IceflowRE/gitcc@v3.0.0
  with:
      # Filepath to a validator file, relative to the root of the repository.
      validator_file: ""
      # Name of builtin validator: 'regex', 'simpletag'
      validator: ""
      # Each line is a separate option passed to the validator (key: "value").
      options: |
          opt1: "val1"
          opt2: "val2"
      # Platform to use: 'github' or 'forgejo'. If empty it will be automatically detected.
      platform: ""
```

> [!warning]
> If you require the `FORGEJO_TOKEN` environment variable and run on GitHub, set `platform` to `github` to avoid errors.

## Builtin validators

### SimpleTag

Format: `[<tag>] <Good Description>` (e.g. `[ci] Fix testing suite installation`)

### RegEx

```yaml
- uses: IceflowRE/gitcc@v3.0.0
  with:
      validator: "RegEx"
      options: |
          summary: ".*"
          description: ".*"
```

## Custom validators

Custom validators can be written in Javascript and placed as a plain file in your repository. Just use the path as a value for `validator_file`.

```yaml
- uses: IceflowRE/gitcc@v3.0.0
  with:
      validator_file: ".github/workflows/myvalidator.mjs"
      options: |
          key1: "val1"
          key2: "val2"
```

The file has to export a function `createValidator` that returns an object with a function `validate(commit: Commit): Result`. This function will be called for each commit and should return a Result object with the validation result.

```js
import * as gitcc from "gitcc"

export function createValidator(options) {
    return {
        validate(commit) {
            return gitcc.valid()
        }
    }
}
```

A full example can be found [here](https://github.com/IceflowRE/gitcc/tree/main/example/simpletag.mjs).

Helper functions are available in the `gitcc` module. Import with `import * as gitcc from "gitcc"`.

- **`function invalid(message: string, commit?: Commit): Result`**  
  Helper function to create a Result with status `Status.Invalid`.
- **`function valid(commit?: Commit): Result`**  
  Helper function to create a Result with status `Status.Valid`.
- **`function warning(message: string, commit?: Commit): Result`**  
  Helper function to create a Result with status `Status.Warning`.
- **`function splitCommitMessage(msg: string): [string, string]`**  
  Helper function to split a commit message into summary and description.

### Reference

```ts
export interface User {
    email?: string
    name?: string
    username?: string
}

export interface Commit {
    author?: User
    committer?: User
    distinct?: boolean
    hexsha?: string
    timestamp?: Date
    // the full commit message, including summary and description.
    message?: string
}
```

## Changelog

### 3.0.0

- Enable unmutable releases.
- Refactor codebase to be more maintainable and extensible.
- Simplify custom scripts.

#### Migration

If you used custom validators, you have to read the [custom validator section](#custom-validators) and adapt your scripts. The scripts got simplified and migration should be straightforward with minimal changes.

### 2.1.0

- Running on Node 24 in GitHub Actions.

## License

Copyright 2021-present Iceflower S (iceflower@iceflower.eu)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
