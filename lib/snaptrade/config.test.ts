import { describe, expect, it } from "vitest";
import { redirectUri, requireEnv } from "./config";

describe("requireEnv", () => {
    it("returns the value when it's set", () => {
        process.env.PAWKET_TEST = "hello";
        expect(requireEnv("PAWKET_TEST")).toBe("hello");
    })
    it("throws, naming the variable, when it's missing", () => {
        delete process.env.PAWKET_TEST;
        expect(() => requireEnv("PAWKET_TEST")).toThrow("Missing environment variable PAWKET_TEST");
    });
    it("builds the callback address, ignoring a trailing slash", () => {
        process.env.APP_URL = "http://localhost:3001/"; 
        expect(redirectUri()).toBe("http://localhost:3001/oauth/snaptrade/callback")
    })
});