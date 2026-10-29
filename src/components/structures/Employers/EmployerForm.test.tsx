import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/hooks/useMoney", () => ({ useCurrency: () => "AUD" }));
vi.mock("@/server-actions/business-lookup", () => ({
  onLookupBusiness: vi.fn(async () => ({
    ok: true,
    kind: "details",
    details: {
      registry: "abr",
      id: "51 824 753 556",
      active: false,
      status: "Cancelled",
      statusSince: "2024-01-01",
      legalName: "Sunny Holdings Pty Ltd",
      names: ["Sunny Farms", "Sunny Holdings Pty Ltd"],
      fields: { taxId: "51 824 753 556", region: "QLD", postcode: "4670", country: "Australia" },
      facts: [{ label: "Type", value: "Australian Private Company" }],
      note: "The register has no street address: add it yourself.",
    },
    searchedAt: new Date().toISOString(),
  })),
}));

import EmployerForm from "@/components/structures/Employers/EmployerForm";

import { renderWithIntl } from "#/__test__/utils/intl";

function setup() {
  const onSave = vi.fn();
  renderWithIntl(<EmployerForm busy={false} onCancel={() => {}} onSave={onSave} />);
  return { onSave, user: userEvent.setup() };
}

describe("EmployerForm helpers", () => {
  test("pasted details fill the fields, highlighted until edited", async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByRole("button", { name: /paste details/i }));
    const box = screen.getByLabelText(/paste anything/i);
    await user.click(box);
    await user.paste(
      "Sunny Farms Pty Ltd\nABN 51 824 753 556\n12 Packhouse Rd, Bundaberg QLD 4670\njobs@sunny.com.au"
    );
    await user.click(screen.getByRole("button", { name: /fill 8 fields/i }));

    const name = screen.getByLabelText("Name") as HTMLInputElement;
    expect(name.value).toBe("Sunny Farms Pty Ltd");
    expect((screen.getByLabelText("State or region") as HTMLInputElement).value).toBe("QLD");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("jobs@sunny.com.au");
    expect(name.className).toMatch(/bg-accent-soft/);
    expect(screen.getByText(/guessed from the text/i)).toBeInTheDocument();

    await user.type(name, "!");
    expect(name.className).not.toMatch(/bg-accent-soft/);

    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sunny Farms Pty Ltd!",
        taxId: "51 824 753 556",
        city: "Bundaberg",
        region: "QLD",
        postcode: "4670",
        country: "Australia",
      })
    );
  });

  test("business lookup: warns on a cancelled ABN and keeps the legal name in the notes", async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByRole("button", { name: /look up business/i }));
    await user.type(screen.getByLabelText(/abn or business name/i), "51824753556{Enter}");

    expect(await screen.findByText(/this abn is cancelled/i)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Sunny Farms" }));
    await user.click(screen.getByRole("button", { name: /use these details/i }));

    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Sunny Farms");
    expect((screen.getByLabelText("Tax or business no.") as HTMLInputElement).value).toBe(
      "51 824 753 556"
    );
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).value).toBe(
      "Legal name: Sunny Holdings Pty Ltd"
    );

    // The source and time of the search: shown, not editable, sent with the save.
    expect(screen.getByTestId("employer-source")).toHaveTextContent(
      /^Data sourced from the Australian Business Register, \d{1,2} \w{3} \d{4}, \d{2}:\d{2}$/
    );
    expect(screen.queryByRole("textbox", { name: /data sourced/i })).toBeNull();
    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ source: { registry: "abr", at: expect.any(String) } })
    );
  });

  test("filling a New Zealand employer switches the currency to NZD", async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByRole("button", { name: /paste details/i }));
    await user.click(screen.getByLabelText(/paste anything/i));
    await user.paste("Kiwi Orchards Limited\n45 Orchard Road\nHastings\nNew Zealand");
    // The preview says which currency it'll set.
    expect(screen.getByText("Currency", { selector: "dt" }).nextSibling).toHaveTextContent("NZD");
    await user.click(screen.getByRole("button", { name: /^fill \d+ fields?/i }));

    const currency = screen.getByLabelText("Currency");
    expect(currency).toHaveTextContent("NZD");
    expect(currency.className).toMatch(/bg-accent-soft/);

    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ country: "New Zealand", defaultCurrency: "NZD" })
    );
  });

  test("the currency opens a list instead of a native select", async () => {
    const { user, onSave } = setup();

    expect(document.querySelector("select")).toBeNull();
    const currency = screen.getByLabelText("Currency");
    expect(currency).toHaveTextContent("AUD (Settings)");

    await user.click(currency);
    const list = await screen.findByRole("listbox", { name: "Currency" });
    await user.click(within(list).getByRole("option", { name: /^GBP/ }));

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(currency).toHaveTextContent("GBP");

    await user.type(screen.getByLabelText("Name"), "Sunny Farms");
    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ defaultCurrency: "GBP" }));
  });

  test("picking AUD with no country fills in Australia", async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByLabelText("Currency"));
    await user.click(
      within(await screen.findByRole("listbox", { name: "Currency" })).getByRole("option", {
        name: /^AUD ·/,
      })
    );

    const country = screen.getByTestId("employer-country");
    expect(country).toHaveTextContent("Australia");
    expect(country.className).toMatch(/bg-accent-soft/);

    await user.type(screen.getByLabelText("Name"), "Sunny Farms");
    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ country: "Australia", defaultCurrency: "AUD" })
    );
  });

  test("the country is picked from a list and sets the currency", async () => {
    const { user, onSave } = setup();

    await user.click(screen.getByTestId("employer-country"));
    await user.type(screen.getByRole("searchbox", { name: "Search country" }), "zeal");
    await user.click(screen.getByRole("option", { name: /New Zealand/ }));

    expect(screen.getByLabelText("Currency")).toHaveTextContent("NZD");
    await user.type(screen.getByLabelText("Name"), "Kiwi Orchards");
    await user.click(screen.getByRole("button", { name: /add employer/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ country: "New Zealand", defaultCurrency: "NZD" })
    );
  });

  test("a misspelt saved country offers the right one", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    renderWithIntl(
      <EmployerForm
        busy={false}
        onCancel={() => {}}
        onSave={onSave}
        employer={
          {
            id: 1,
            name: "Kiwi Orchards",
            country: "New Zeland",
            defaultCurrency: "NZD",
            archived: false,
            shifts: 0,
          } as never
        }
      />
    );

    expect(screen.getByTestId("employer-country")).toHaveTextContent("New Zeland");
    expect(
      screen.getByText(/isn't on the list\. Did you mean .*New Zealand\?/)
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Use .*New Zealand/ }));

    expect(screen.queryByText(/isn't on the list/)).toBeNull();
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ country: "New Zealand" }));
  });

  test("a country saved as a code shows as its name", () => {
    renderWithIntl(
      <EmployerForm
        busy={false}
        onCancel={() => {}}
        onSave={vi.fn()}
        employer={{ id: 1, name: "Farm", country: "AU", archived: false, shifts: 0 } as never}
      />
    );
    expect(screen.getByTestId("employer-country")).toHaveTextContent("Australia");
    expect(screen.queryByText(/isn't on the list/)).toBeNull();
  });

  test("an Australian postcode says its specified-work areas and fixes the state", async () => {
    const { user } = setup();

    await user.click(screen.getByTestId("employer-country"));
    await user.type(screen.getByRole("searchbox", { name: "Search country" }), "austral");
    await user.click(screen.getByRole("option", { name: /Australia/ }));

    await user.type(screen.getByLabelText("Postcode"), "4870");
    const hint = screen.getByTestId("au-postcode-hint");
    expect(hint).toHaveTextContent(
      "4870 is in: Regional Australia · Northern Australia · Remote Australia"
    );
    // No state yet: offered from the postcode.
    await user.click(within(hint).getByRole("button", { name: "Use QLD" }));
    expect((screen.getByLabelText("State or region") as HTMLInputElement).value).toBe("QLD");

    const region = screen.getByLabelText("State or region");
    await user.clear(region);
    await user.type(region, "VIC");
    expect(screen.getByTestId("au-postcode-hint")).toHaveTextContent(
      "4870 is a QLD postcode, not VIC."
    );

    const postcode = screen.getByLabelText("Postcode");
    await user.clear(postcode);
    await user.type(postcode, "3000");
    expect(screen.getByTestId("au-postcode-hint")).toHaveTextContent(
      "3000 isn't in a specified-work area"
    );
  });

  test("no postcode hint outside Australia", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Postcode"), "4870");
    expect(screen.queryByTestId("au-postcode-hint")).toBeNull();
  });
});
