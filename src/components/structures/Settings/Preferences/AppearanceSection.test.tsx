import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useDateFormatStore } from "@/store/useDateFormatStore";

const mocks = vi.hoisted(() => ({
  config: { timeFormat: "auto", dateFormat: "auto", theme: "system" } as Record<string, string>,
  save: vi.fn(async (_patch: Record<string, unknown>) => true),
}));

vi.mock("@/hooks/usePreferences", () => ({
  default: () => ({ config: mocks.config, save: mocks.save }),
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/settings",
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/utils/theme", () => ({
  applyTheme: vi.fn(),
  isThemePreference: () => true,
  readThemeCookie: () => "system",
}));

import AppearanceSection from "@/components/structures/Settings/Preferences/AppearanceSection";

import { renderWithIntl } from "#/__test__/utils/intl";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 23, 13, 5));
  useDateFormatStore.setState({ time: "auto", date: "auto" });
  mocks.save.mockClear();
});

describe("Appearance: time and date", () => {
  test("shows how it reads now and saves the choice", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithIntl(<AppearanceSection />);
    expect(screen.getByText("Now: 1:05 PM")).toBeInTheDocument();
    expect(screen.getByText("Now: Fri 23 Oct")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "24 h" }));
    expect(mocks.save).toHaveBeenCalledWith({ timeFormat: "24" });
    await user.click(screen.getByRole("radio", { name: "Oct 23" }));
    expect(mocks.save).toHaveBeenCalledWith({ dateFormat: "mdy" });

    // Once saved (DateFormatSync fills the store), the examples follow.
    act(() => useDateFormatStore.setState({ time: "24", date: "mdy" }));
    expect(screen.getByText("Now: 13:05")).toBeInTheDocument();
    expect(screen.getByText("Now: Fri, Oct 23")).toBeInTheDocument();
  });
});
