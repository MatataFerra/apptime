import type { CSSProperties, ReactNode } from "react";

/*
 * Email-safe building blocks: tables and inline styles only (Gmail, Outlook
 * and Apple Mail drop <style>, flex and CSS variables), the app's colours
 * written out, and fonts that fall back to the system's.
 */

export const EMAIL_COLORS = {
  paper: "#f4f6f5",
  surface: "#ffffff",
  sunken: "#eaeeec",
  border: "#dde3e0",
  ink: "#14211c",
  muted: "#5b6964",
  subtle: "#8a9792",
  accent: "#0e7a57",
  accentSoft: "#dcf1e8",
  onInk: "#f4f6f5",
} as const;

const FONT =
  "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const DISPLAY =
  "'Bricolage Grotesque', 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const text: CSSProperties = {
  margin: "0 0 16px",
  fontFamily: FONT,
  fontSize: "16px",
  lineHeight: "24px",
  color: EMAIL_COLORS.ink,
};

/** Base URL of the app, for links and the logo ("https://…/", trailing slash). */
export function appBaseUrl() {
  const base = process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  return base ? `${base.replace(/\/$/, "")}/` : "";
}

export function EmailLayout({
  lang,
  title,
  preview,
  footer,
  children,
}: {
  lang: string;
  title: string;
  /** The line inbox lists show next to the subject. */
  preview: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const base = appBaseUrl();
  return (
    <html lang={lang}>
      {/* eslint-disable-next-line @next/next/no-head-element -- an email, not a Next page */}
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: EMAIL_COLORS.paper }}>
        {/* Preview text, hidden in the email itself. */}
        <div
          style={{
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
            opacity: 0,
            fontSize: "1px",
            lineHeight: "1px",
            color: EMAIL_COLORS.paper,
          }}
        >
          {preview}
          {" ‌".repeat(60)}
        </div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ backgroundColor: EMAIL_COLORS.paper }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ maxWidth: "520px" }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "0 4px 20px" }}>
                        <a href={base} style={{ textDecoration: "none", color: EMAIL_COLORS.ink }}>
                          {base ? (
                            // eslint-disable-next-line @next/next/no-img-element -- emails need a plain <img>
                            <img
                              src={`${base}apple-icon.png`}
                              width={32}
                              height={32}
                              alt=""
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                borderRadius: "8px",
                                border: 0,
                              }}
                            />
                          ) : null}
                          <span
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              marginLeft: base ? "10px" : 0,
                              fontFamily: DISPLAY,
                              fontSize: "20px",
                              fontWeight: 700,
                              letterSpacing: "-0.01em",
                              color: EMAIL_COLORS.ink,
                            }}
                          >
                            nomadshift
                          </span>
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: EMAIL_COLORS.surface,
                          border: `1px solid ${EMAIL_COLORS.border}`,
                          borderRadius: "16px",
                          padding: "32px 28px",
                        }}
                      >
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "20px 4px 0",
                          fontFamily: FONT,
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: EMAIL_COLORS.subtle,
                        }}
                      >
                        {footer}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        margin: "0 0 12px",
        fontFamily: DISPLAY,
        fontSize: "24px",
        lineHeight: "30px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: EMAIL_COLORS.ink,
      }}
    >
      {children}
    </h1>
  );
}

export function EmailText({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <p style={{ ...text, color: muted ? EMAIL_COLORS.muted : EMAIL_COLORS.ink }}>{children}</p>
  );
}

/** A button that holds up in Outlook too: a padded link inside a table cell. */
export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: "8px 0 24px" }}
    >
      <tbody>
        <tr>
          <td style={{ backgroundColor: EMAIL_COLORS.ink, borderRadius: "12px" }}>
            <a
              href={href}
              target="_blank"
              style={{
                display: "inline-block",
                padding: "14px 24px",
                fontFamily: FONT,
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "20px",
                color: EMAIL_COLORS.onInk,
                textDecoration: "none",
                borderRadius: "12px",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** "Button not working? Paste this link": the full URL, shown as it is. */
export function EmailFallbackLink({ label, href }: { label: string; href: string }) {
  return (
    <p
      style={{
        margin: "0 0 20px",
        fontFamily: FONT,
        fontSize: "13px",
        lineHeight: "20px",
        color: EMAIL_COLORS.muted,
      }}
    >
      {label}
      <br />
      <a href={href} style={{ color: EMAIL_COLORS.accent, wordBreak: "break-all" }}>
        {href}
      </a>
    </p>
  );
}

/** A soft note at the end: "Wasn't you? Ignore this email". */
export function EmailNote({ children }: { children: ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ marginTop: "4px" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: EMAIL_COLORS.sunken,
              borderRadius: "12px",
              padding: "14px 16px",
              fontFamily: FONT,
              fontSize: "14px",
              lineHeight: "21px",
              color: EMAIL_COLORS.muted,
            }}
          >
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
