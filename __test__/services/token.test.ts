import { describe, expect, test, vi } from "vitest";

import { NEXT_AUTH_SESSION_TOKEN } from "@/utils/constants";

import TokenService from "../../src/services/Token";

describe("TokenService", () => {
  const cookie = "test-cookie";
  const tokenService = new TokenService(cookie);

  describe("decodedCookieData", () => {
    test("should return decoded cookie data if cookie is provided", async () => {
      // Mock the decode function
      vi.spyOn(TokenService.prototype, "decodedCookieData").mockResolvedValueOnce({
        email: "test@example.com",
        name: "Test User",
        picture: "test.jpg",
        sub: "1234567890",
        accessToken: "",
        image: "",
        role: "USER",
      });

      const result = await tokenService.decodedCookieData();
      expect(result).toEqual({
        email: "test@example.com",
        name: "Test User",
        picture: "test.jpg",
        sub: "1234567890",
        accessToken: "",
        image: "",
        role: "USER",
      });
    });
  });

  describe("getCookie", () => {
    test("reads the named cookie from the given source", async () => {
      const jar = new Map([["test-cookie", { name: "test-cookie", value: "test-cookie-value" }]]);
      const result = await new TokenService("test-cookie").getCookie({ get: (n) => jar.get(n) });
      expect(result).toEqual({ name: "test-cookie", value: "test-cookie-value" });
    });

    test("falls back to the next-auth session cookie", async () => {
      const jar = new Map([
        [NEXT_AUTH_SESSION_TOKEN, { name: NEXT_AUTH_SESSION_TOKEN, value: "session" }],
      ]);
      const result = await new TokenService("missing").getCookie({ get: (n) => jar.get(n) });
      expect(result?.value).toBe("session");
    });
  });

  describe("createToken", () => {
    test("should create a token with the provided data", async () => {
      // Mock the encode function
      vi.spyOn(TokenService, "createToken").mockResolvedValueOnce("test-token");

      const data = {
        email: "test@example.com",
        name: "Test User",
        picture: "test.jpg",
        sub: "1234567890",
      };

      const result = await TokenService.createToken(data);
      expect(result).toBe("test-token");
    });
  });
});
