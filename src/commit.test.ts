import { describe, expect, it } from "@jest/globals"
import { splitCommitMessage } from "@/commit"

describe("splitCommitMessage", () => {
    it("returns empty strings for undefined", () => {
        expect(splitCommitMessage(undefined as unknown as string)).toEqual(["", ""])
    })

    it("returns message as summary when no double newline", () => {
        expect(splitCommitMessage("fix something")).toEqual(["fix something", ""])
    })

    it("returns message as summary when only single newline", () => {
        expect(splitCommitMessage("fix something\nmore")).toEqual(["fix something\nmore", ""])
    })

    it("splits on double newline", () => {
        expect(splitCommitMessage("fix something\n\ndescription here")).toEqual(["fix something", "description here"])
    })

    it("splits on first double newline only", () => {
        expect(splitCommitMessage("fix something\n\nfirst\n\nsecond")).toEqual(["fix something", "first\n\nsecond"])
    })

    it("returns empty summary when message starts with double newline", () => {
        expect(splitCommitMessage("\n\ndescription")).toEqual(["", "description"])
    })

    it("returns empty strings for empty string", () => {
        expect(splitCommitMessage("")).toEqual(["", ""])
    })
})
