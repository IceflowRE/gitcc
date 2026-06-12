export function greenText(text: string): string {
    return `\u001b[0;32m${text}\u001b[0m`
}

export function redText(text: string): string {
    return `\u001b[0;31m${text}\u001b[0m`
}

export function yellowText(text: string): string {
    return `\u001b[0;33m${text}\u001b[0m`
}
