import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  accounts: [{ id: "acc-1", providerId: "credential" }] as { id: string; providerId: string }[],
  changeEmail: vi.fn(async (_: unknown) => ({ data: { status: true }, error: null })),
  changePassword: vi.fn(async (_: unknown) => ({
    data: {},
    error: null as null | { code: string },
  })),
  unlinkAccount: vi.fn(async (_: unknown) => ({ data: { status: true }, error: null })),
  revoke: vi.fn(async (_: string) => ({ response: true })),
  revokeOthers: vi.fn(async () => ({ response: true })),
  setPassword: vi.fn(async (_: string) => ({ response: true })),
}));

vi.mock("@/utils/auth/client", () => ({
  authClient: {
    listAccounts: async () => ({ data: mocks.accounts, error: null }),
    changeEmail: mocks.changeEmail,
    changePassword: mocks.changePassword,
    unlinkAccount: mocks.unlinkAccount,
    linkSocial: vi.fn(async () => ({ data: {}, error: null })),
  },
}));
vi.mock("@/server-actions/account-security", () => ({
  listActiveSessions: async () => [
    {
      id: "s1",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      current: true,
    },
    {
      id: "s2",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date(Date.now() - 3 * 3600e3).toISOString(),
      current: false,
    },
  ],
  revokeActiveSession: mocks.revoke,
  revokeOtherActiveSessions: mocks.revokeOthers,
  setAccountPassword: mocks.setPassword,
}));
vi.mock("@/hooks/useUser", () => ({
  default: () => ({ data: { email: "mati@example.com", name: "Mati" } }),
}));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/settings",
}));

import SecuritySection from "@/components/structures/Settings/Security/SecuritySection";

import { renderWithIntl } from "#/__test__/utils/intl";

function setup() {
  const user = userEvent.setup();
  renderWithIntl(
    <QueryClientProvider client={new QueryClient()}>
      <SecuritySection />
    </QueryClientProvider>
  );
  return { user };
}

beforeEach(() => {
  mocks.accounts = [{ id: "acc-1", providerId: "credential" }];
  for (const fn of Object.values(mocks)) if (typeof fn === "function") fn.mockClear();
});

describe("Account and security", () => {
  test("asks to confirm a new email from its inbox", async () => {
    const { user } = setup();
    expect(await screen.findByText("mati@example.com")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Change" })[0]);
    await user.type(screen.getByLabelText("New email"), "New@Example.com");
    await user.click(screen.getByRole("button", { name: "Send link" }));

    expect(mocks.changeEmail).toHaveBeenCalledWith({
      newEmail: "new@example.com",
      callbackURL: "/en/settings?email=updated",
    });
  });

  test("changing the password asks for the current one and signs others out", async () => {
    const { user } = setup();
    await screen.findByText("Password");

    await user.click(screen.getAllByRole("button", { name: "Change" })[1]);
    const save = screen.getByRole("button", { name: "Save password" });
    await user.type(screen.getByLabelText("Current password"), "Old-pass1!");
    await user.type(screen.getByLabelText("New password"), "New-pass1!");
    await user.type(screen.getByLabelText("Repeat new password"), "New-pass2!");
    expect(screen.getByText("The passwords don't match")).toBeInTheDocument();
    expect(save).toBeDisabled();

    await user.clear(screen.getByLabelText("Repeat new password"));
    await user.type(screen.getByLabelText("Repeat new password"), "New-pass1!");
    await user.click(save);

    expect(mocks.changePassword).toHaveBeenCalledWith({
      currentPassword: "Old-pass1!",
      newPassword: "New-pass1!",
      revokeOtherSessions: true,
    });
  });

  test("Google only: create a password, and Google can't be unlinked yet", async () => {
    mocks.accounts = [{ id: "g-1", providerId: "google" }];
    const { user } = setup();

    expect(await screen.findByText("You only sign in with Google.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlink" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.queryByLabelText("Current password")).toBeNull();
    await user.type(screen.getByLabelText("New password"), "New-pass1!");
    await user.type(screen.getByLabelText("Repeat new password"), "New-pass1!");
    await user.click(screen.getByRole("button", { name: "Save password" }));

    expect(mocks.setPassword).toHaveBeenCalledWith("New-pass1!");
  });

  test("with a password, Google can be unlinked", async () => {
    mocks.accounts = [
      { id: "acc-1", providerId: "credential" },
      { id: "g-1", providerId: "google" },
    ];
    const { user } = setup();

    await user.click(await screen.findByRole("button", { name: "Unlink" }));
    expect(mocks.unlinkAccount).toHaveBeenCalledWith({ accountId: "g-1" });
  });

  test("lists devices and signs the others out", async () => {
    const { user } = setup();

    const list = (await screen.findByText("Safari on iOS")).closest("ul") as HTMLElement;
    expect(within(list).getByText("Chrome on macOS")).toBeInTheDocument();

    await user.click(within(list).getByRole("button", { name: "Sign out" }));
    expect(mocks.revoke).toHaveBeenCalledWith("s2");

    await user.click(screen.getByRole("button", { name: "Sign out of other devices" }));
    expect(mocks.revokeOthers).toHaveBeenCalled();
  });
});
