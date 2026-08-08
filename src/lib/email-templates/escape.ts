/**
 * Escape user-controlled strings before interpolating into HTML email bodies.
 * Defense-in-depth: better-auth validates the inputs, but a future change
 * to validation or a different code path that feeds these helpers could
 * allow HTML/JS injection into rendered email clients.
 */
export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Escape a URL for safe inclusion in an `href` attribute. Preserves the
 * URL's semantics by encoding characters that would break out of the
 * attribute or inject markup (quotes, angle brackets, spaces).
 */
export function escapeUrl(value: string): string {
    return value.replace(/[\\"\s<>]/g, (ch) => {
        switch (ch) {
            case "\\": return "\\\\";
            case '"': return "%22";
            case "<": return "%3C";
            case ">": return "%3E";
            case " ": return "%20";
            default: return ch;
        }
    });
}
