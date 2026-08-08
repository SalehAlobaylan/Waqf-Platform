/**
 * Verifies that messages/en.json and messages/ar.json have identical
 * key structures. Fails with a diff summary when they drift.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface DiffEntry {
    key: string;
    status: "missing" | "extra";
    locale: string;
}

function flatten(obj: unknown, prefix = ""): string[] {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return [];
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            keys.push(...flatten(value, path));
        } else {
            keys.push(path);
        }
    }
    return keys;
}

function main() {
    const root = join(process.cwd(), "messages");
    const en = JSON.parse(readFileSync(join(root, "en.json"), "utf-8"));
    const ar = JSON.parse(readFileSync(join(root, "ar.json"), "utf-8"));

    const enKeys = new Set(flatten(en));
    const arKeys = new Set(flatten(ar));

    const diffs: DiffEntry[] = [];
    for (const key of enKeys) {
        if (!arKeys.has(key)) diffs.push({ key, status: "missing", locale: "ar" });
    }
    for (const key of arKeys) {
        if (!enKeys.has(key)) diffs.push({ key, status: "extra", locale: "ar" });
    }

    if (diffs.length > 0) {
        console.error(`i18n key mismatch (${diffs.length}):`);
        for (const diff of diffs.slice(0, 50)) {
            console.error(`  [${diff.locale}] ${diff.status}: ${diff.key}`);
        }
        if (diffs.length > 50) {
            console.error(`  ... and ${diffs.length - 50} more`);
        }
        process.exit(1);
    }

    console.log(`i18n OK — ${enKeys.size} keys in sync between en and ar`);
}

main();
