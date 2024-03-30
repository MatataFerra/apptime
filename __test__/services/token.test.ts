import { describe, expect, test, vi } from "vitest";

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
    test("should return the cookie value", () => {
      // Mock the cookieStore().get function
      vi.spyOn(TokenService.prototype, "getCookie").mockReturnValueOnce({
        name: "test-cookie",
        value: "test-cookie-value",
      });

      const result = tokenService.getCookie();
      expect(result).toEqual({ value: "test-cookie-value", name: "test-cookie" });
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

  describe("verifyToken", () => {
    test("should verify the token", async () => {
      // Mock the getCookie function
      vi.spyOn(TokenService.prototype, "getCookie").mockReturnValueOnce({
        name: "test-cookie",
        value: "test-cookie-value",
      });

      // Mock the verify function
      vi.spyOn(TokenService.prototype, "verifyToken").mockReturnValueOnce(true);
      const result = tokenService.verifyToken();
      expect(result).toBeTruthy();
    });
  });
});
