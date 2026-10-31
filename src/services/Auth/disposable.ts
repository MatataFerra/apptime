import MailChecker from "mailchecker";

/**
 * True for addresses of temporary inbox services (10minutemail, mailinator,
 * yopmail…), from mailchecker's list, subdomains included. Also true for
 * anything that isn't a valid address.
 */
export function isDisposableEmail(email: string) {
  return !MailChecker.isValid(email.trim());
}
