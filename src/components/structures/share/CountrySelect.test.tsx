import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import CountrySelect from "@/components/structures/share/CountrySelect";

import { renderWithIntl } from "#/__test__/utils/intl";

function setup(value: string | null = null, locale: "en" | "es" = "en") {
  const onChange = vi.fn();
  const user = userEvent.setup();
  renderWithIntl(
    <CountrySelect
      label="Country"
      value={value}
      placeholder="Select your country"
      searchPlaceholder="Search your country"
      onChange={onChange}
    />,
    locale
  );
  return { user, onChange };
}

describe("CountrySelect", () => {
  test("shows the saved country with its flag, or the placeholder", () => {
    setup("Germany");
    expect(screen.getByRole("button", { name: /Country: .*Germany/ })).toBeInTheDocument();
  });

  test("searches and saves the English name", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: /Country: Select your country/ }));
    await user.type(screen.getByRole("searchbox", { name: "Search your country" }), "zeal");

    const list = screen.getByRole("listbox", { name: "Country" });
    await user.click(within(list).getByRole("option", { name: /New Zealand/ }));
    expect(onChange).toHaveBeenCalledWith("New Zealand");
  });

  test("in Spanish it lists names in Spanish and still finds the English one", async () => {
    const { user, onChange } = setup(null, "es");
    await user.click(screen.getByRole("button", { name: /Country: Select your country/ }));
    const search = screen.getByRole("searchbox", { name: "Search your country" });

    await user.type(search, "alemania");
    expect(screen.getByRole("option", { name: /Alemania/ })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "germany");
    await user.click(screen.getByRole("option", { name: /Alemania/ }));
    expect(onChange).toHaveBeenCalledWith("Germany");
  });
});
