import { describe, expect, test } from "vitest";

import { isDisposableEmail } from "@/services/Auth/disposable";
import { EMAIL_VERIFY_GRACE_MS, isVerificationOverdue } from "@/services/Auth/verification";

const now = Date.UTC(2026, 9, 30, 12);
function hoursAgo(h: number) {
  return new Date(now - h * 60 * 60 * 1000);
}

describe("isVerificationOverdue", () => {
  test("the grace period is 8 hours", () => {
    expect(EMAIL_VERIFY_GRACE_MS).toBe(8 * 60 * 60 * 1000);
  });

  test("unconfirmed: fine up to 8 hours, overdue after", () => {
    expect(isVerificationOverdue({ emailVerified: false, createdAt: hoursAgo(7.9) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: hoursAgo(8) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: hoursAgo(8.1) }, now)).toBe(
      true
    );
  });

  test("confirmed accounts never are, however old", () => {
    expect(isVerificationOverdue({ emailVerified: true, createdAt: hoursAgo(1000) }, now)).toBe(
      false
    );
  });

  test("the date may come as a string (cookie cache), and missing data doesn't restrict", () => {
    expect(
      isVerificationOverdue({ emailVerified: false, createdAt: hoursAgo(9).toISOString() }, now)
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
