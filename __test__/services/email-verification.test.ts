import { describe, expect, test } from "vitest";

import { isDisposableEmail } from "@/services/Auth/disposable";
import {
  EMAIL_VERIFY_GRACE_MS,
  EMAIL_VERIFY_LINK_TTL_S,
  isVerificationOverdue,
} from "@/services/Auth/verification";

const now = Date.UTC(2026, 9, 30, 12);
function minutesAgo(m: number) {
  return new Date(now - m * 60 * 1000);
}

describe("isVerificationOverdue", () => {
  test("5 minutes of grace; the link itself lasts 24 hours", () => {
    expect(EMAIL_VERIFY_GRACE_MS).toBe(5 * 60 * 1000);
    expect(EMAIL_VERIFY_LINK_TTL_S).toBe(24 * 60 * 60);
  });

  test("unconfirmed: fine up to 5 minutes, overdue after", () => {
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(4.9) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(5) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(5.1) }, now)).toBe(
      true
    );
  });

  test("confirmed accounts never are, however old", () => {
    expect(
      isVerificationOverdue({ emailVerified: true, createdAt: minutesAgo(100_000) }, now)
    ).toBe(false);
  });

  test("the date may come as a string (cookie cache), and missing data doesn't restrict", () => {
    expect(
      isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(10).toISOString() }, now)
    ).toBe(true);
    expect(isVerificationOverdue({ emailVerified: false, createdAt: null }, now)).toBe(false);
    expect(isVerificationOverdue({ emailVerified: false, createdAt: "nope" }, now)).toBe(false);
    expect(isVerificationOverdue(null, now)).toBe(false);
  });
});

describe("isDisposableEmail", () => {
  test.each([
    "a@10minutemail.com",
    "a@mailinator.com",
    "A@YOPMAIL.COM",
    "a@guerrillamail.com",
    "a@sub.mailinator.com",
    "  a@temp-mail.org ",
  ])("%s is a temporary inbox", (email) => expect(isDisposableEmail(email)).toBe(true));

  test.each(["a@gmail.com", "ana@outlook.com", "mati@x.com", " ana@proton.me "])(
    "%s is fine",
    (email) => expect(isDisposableEmail(email)).toBe(false)
  );
});
