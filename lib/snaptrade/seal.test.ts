import { describe, expect, it } from "vitest";
import { seal, unseal } from "./seal";


process.env.SESSION_SECRET = "test-secret";

describe("seal", () => {
    it("unseals back to the same data", () => {
        expect(unseal(seal({ token: "abc" }))).toEqual({ token: "abc" });
    });
    it("gives a different result each time", () => {
        expect(seal({ token: "abc" })).not.toBe(seal({ token: "abc" }));
    });
    it("rejects a tampered cookie", () => {
        const sealed = seal({ token: "abc" });
        const tampered = sealed.slice(0, -1) + (sealed.endsWith("A") ? "B" : "A");
        expect(unseal(tampered)).toBeNull();
    });
});