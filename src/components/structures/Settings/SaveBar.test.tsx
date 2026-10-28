import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updatePreferences: vi.fn(async (_patch: unknown) => ({ ok: true })),
  updateSettings: vi.fn(async (_values: unknown) => [{}, {}] as unknown),
  docked: false,
}));

vi.mock("@/hooks/useUser", () => ({
  default: () => ({
    data: {
      email: "mati@x.com",
      config: { earningsGoal: 800, goalPeriod: "week", currency: "USD", theme: "system" },
    },
  }),
}));
vi.mock("@/hooks/useMoney", () => ({ useCurrency: () => "USD", default: () => String }));
vi.mock("@/server-actions/update-preferences", () => ({ default: mocks.updatePreferences }));
vi.mock("@/server-actions/update-settings", () => ({ default: mocks.updateSettings }));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));

import GoalSection from "@/components/structures/Settings/Preferences/GoalSection";
import SaveBar from "@/components/structures/Settings/SaveBar";

import { SettingsDraftProvider } from "@/providers/SettingsDraft";

import { usePreferencesDraft } from "@/store/usePreferencesDraft";
import { useSettingsStore } from "@/store/useSettingsStore";
import { renderWithIntl } from "#/__test__/utils/intl";

let observe: (visible: boolean) => void = () => {};

beforeEach(() => {
  mocks.updatePreferences.mockClear();
  mocks.updateSettings.mockClear();
  usePreferencesDraft.getState().clear();
  const blank = {
    account: { email: "", name: "Mati" },
    personal: { city: "Berlin", country: "Germany" },
    configs: { weekStartsOn: "" },
  };
  useSettingsStore.setState({ values: blank, defaultValues: blank });
  // The in-page button starts off screen.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observe = (visible) => cb([{ isIntersecting: visible }]);
        cb([{ isIntersecting: false }]);
      }
      observe() {}
      disconnect() {}
    }
  );
});

function setup() {
  const user = userEvent.setup();
  renderWithIntl(
    <QueryClientProvider client={new QueryClient()}>
      <SettingsDraftProvider>
        <GoalSection />
        <SaveBar />
      </SettingsDraftProvider>
    </QueryClientProvider>
  );
  return { user };
}

describe("Settings save bar", () => {
  test("changes wait; one request saves them all", async () => {
    const { user } = setup();
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).toBeNull();

    await user.click(screen.getByRole("radio", { name: "Month" }));
    const goal = screen.getByLabelText("Goal");
    await user.clear(goal);
    await user.type(goal, "1200");
    fireEvent.blur(goal);

    // Nothing sent yet; the floating bar shows up.
    expect(mocks.updatePreferences).not.toHaveBeenCalled();
    const bar = screen.getByRole("region", { name: "Unsaved changes" });
    expect(screen.getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "true");

    await user.click(within(bar).getByRole("button", { name: "Save changes" }));
    expect(mocks.updatePreferences).toHaveBeenCalledTimes(1);
    expect(mocks.updatePreferences).toHaveBeenCalledWith({
      goalPeriod: "month",
      earningsGoal: 1200,
    });
    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });

  test("going back to the saved value leaves nothing to save", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "Month" }));
    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  test("discard puts back what's saved", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "Month" }));
    await user.click(screen.getAllByRole("button", { name: "Discard" })[0]);
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
    expect(mocks.updatePreferences).not.toHaveBeenCalled();
  });

  test("the floating bar docks when the page's button is on screen", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "Month" }));
    expect(screen.getByRole("region", { name: "Unsaved changes" })).toBeInTheDocument();

    act(() => observe(true));
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  test("your details are saved with the same button", async () => {
    const { user } = setup();
    act(() => observe(true)); // scrolled down to the page's button
    act(() =>
      useSettingsStore
        .getState()
        .setValue({ personal: { city: "Buenos Aires", country: "Argentina" } })
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(mocks.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ personal: { city: "Buenos Aires", country: "Argentina" } })
    );
    expect(mocks.updatePreferences).not.toHaveBeenCalled();
    // Saved: nothing pending any more.
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });
});
