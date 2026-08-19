import { describe, expect, it } from "vitest";
import { parseBody, parseQuery, parseParams, normalizeQueryValue } from "@/lib/validation/parse";
import { z } from "zod";

const MEGABYTE = 1024 * 1024;

function jsonRequest(body: string): Request {
    return new Request("http://localhost/api/test", { method: "POST", body });
}

describe("parseBody", () => {
    it("parses and validates a valid JSON body", async () => {
        const result = await parseBody(jsonRequest('{"title":"Build"}'), z.object({ title: z.string() }));
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toEqual({ title: "Build" });
    });

    it("rejects empty and whitespace-only bodies", async () => {
        for (const body of ["", "   "]) {
            const result = await parseBody(jsonRequest(body), z.object({}));
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("INVALID_JSON");
            }
        }
    });

    it("rejects malformed JSON", async () => {
        const result = await parseBody(jsonRequest("{not json"), z.object({}));
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.code).toBe("INVALID_JSON");
    });

    it("returns schema validation errors as VALIDATION_FAILED", async () => {
        const result = await parseBody(jsonRequest('{"title":1}'), z.object({ title: z.string() }));
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.code).toBe("VALIDATION_FAILED");
    });

    it("rejects bodies over the 1 MB cap", async () => {
        const oversized = "a".repeat(MEGABYTE + 100);
        const result = await parseBody(jsonRequest(oversized), z.object({}));
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe("VALIDATION_FAILED");
            expect(result.error.details[0].message).toBe("Request body is too large");
        }
    });

    it("accepts a body just under the cap", async () => {
        const payload = JSON.stringify({ data: "x".repeat(MEGABYTE - 200) });
        const result = await parseBody(jsonRequest(payload), z.object({ data: z.string() }));
        expect(result.success).toBe(true);
    });
});

describe("parseQuery", () => {
    const requestWith = (query: string) => new Request(`http://localhost/api/test?${query}`);

    it("applies defaults when no params are present", () => {
        const result = parseQuery(requestWith(""), z.object({ limit: z.coerce.number().int().default(20) }));
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.limit).toBe(20);
    });

    it("coerces and validates string params", () => {
        const schema = z.object({ page: z.coerce.number().int().min(1) });
        expect(parseQuery(requestWith("page=3"), schema).success).toBe(true);
        expect(parseQuery(requestWith("page=abc"), schema).success).toBe(false);
    });
});

describe("parseParams", () => {
    it("parses route params", () => {
        const result = parseParams({ id: "  cm9abc  " }, z.object({ id: z.string().trim().min(1) }));
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.id).toBe("cm9abc");
    });

    it("returns validation errors for invalid params", () => {
        const result = parseParams({ id: "" }, z.object({ id: z.string().min(1) }));
        expect(result.success).toBe(false);
    });
});

describe("normalizeQueryValue", () => {
    it("maps null and whitespace to undefined", () => {
        expect(normalizeQueryValue(null)).toBeUndefined();
        expect(normalizeQueryValue("   ")).toBeUndefined();
    });

    it("trims real values", () => {
        expect(normalizeQueryValue("  quran  ")).toBe("quran");
    });
});