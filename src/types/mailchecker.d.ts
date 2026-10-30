/** mailchecker ships no types; only what the app uses (checked against 6.0.21). */
declare module "mailchecker" {
  const MailChecker: {
    /** False for invalid addresses and for disposable email domains. */
    isValid(email: string): boolean;
  };
  export default MailChecker;
}
