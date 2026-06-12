// returns summary and description of a commit message
function splitCommitMessage(msg) {
    if (msg === undefined) {
        return ["", ""];
    }
    const idx = msg.indexOf("\n\n");
    if (idx === -1) {
        return [msg.replace(/\n$/, ""), ""];
    }
    const summary = msg.slice(0, idx);
    const description = msg.slice(idx + 2).replace(/\n$/, "");
    return [summary, description];
}

var Status;
(function (Status) {
    Status["Invalid"] = "Invalid";
    Status["Valid"] = "OK";
    Status["Warning"] = "Warning";
})(Status || (Status = {}));
function valid(commit) {
    return { status: Status.Valid, message: "", commit };
}
function warning(message, commit) {
    return { status: Status.Warning, message, commit };
}
function invalid(message, commit) {
    return { status: Status.Invalid, message, commit };
}

export { invalid, splitCommitMessage, valid, warning };
