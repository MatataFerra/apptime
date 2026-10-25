import { useState } from "react";

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ChoicePopover, ChoiceRow } from "@/components/ui/Choice";

import { renderWithIntl } from "#/__test__/utils/intl";

const CURRENCIES = [
  { value: "AUD", label: "AUD · Australian dollar" },
  { value: "NZD", label: "NZD · New Zealand dollar" },
  { value: "EUR", label: "EUR · Euro" },
];

function TwoRows({ onCurrency = vi.fn() }: { onCurrency?: (v: string) => void }) {
  const [currency, setCurrency] = useState("AUD");
  const [employer, setEmployer] = useState("none");
  return (
    <>
      <ChoiceRow
        label="Employer"
        value={employer}
        onChange={setEmployer}
        options={[
          { value: "1", label: "Berry Farm" },
          { value: "none", label: "None", muted: true, separated: true },
        ]}
      />
      <ChoiceRow
        label="Paid in"
        value={currency}
        onChange={(next) => {
          setCurrency(next);
          onCurrency(next);
        }}
        options={CURRENCIES}
      />
    </>
  );
}

describe("ChoiceRow", () => {
  test("opens under its row, picks a value and closes", async () => {
    const user = userEvent.setup();
    const onCurrency = vi.fn();
    renderWithIntl(<TwoRows onCurrency={onCurrency} />);

    expect(document.querySelector("select")).toBeNull();
    const trigger = screen.getByRole("button", { name: /^Paid in/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    const list = screen.getByRole("listbox", { name: "Paid in" });
    expect(within(list).getByRole("option", { name: /AUD/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    await user.click(within(list).getByRole("option", { name: /NZD/ }));
    expect(onCurrency).toHaveBeenCalledWith("NZD");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveTextContent("NZD · New Zealand dollar");
  });

  test("floats as a menu and keeps the page behind it inert", async () => {
    const user = userEvent.setup();
    renderWithIntl(<TwoRows />);

    const paidIn = screen.getByRole("button", { name: /^Paid in/ });
    await user.click(paidIn);
    const list = screen.getByRole("listbox", { name: "Paid in" });
    // Not inside the row: rendered in a popover layer.
    expect(paidIn.parentElement?.contains(list)).toBe(false);
    // While it's open the rest is hidden from assistive tech, like a native select.
    expect(screen.queryByRole("button", { name: /^Employer/ })).toBeNull();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /^Employer/ }));
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    expect(screen.getByRole("listbox")).toHaveAccessibleName("Employer");
  });

  test("arrow keys move through the options and Escape closes", async () => {
    const user = userEvent.setup();
    renderWithIntl(<TwoRows />);

    const trigger = screen.getByRole("button", { name: /^Paid in/ });
    await user.click(trigger);
    // Opens on the picked option.
    expect(screen.getByRole("option", { name: /AUD/ })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /NZD/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("option", { name: /EUR/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /AUD/ })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  test("an action option has no check and doesn't count as the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithIntl(
      <ChoiceRow
        label="Employer"
        value="1"
        onChange={onChange}
        options={[
          { value: "1", label: "Berry Farm" },
          { value: "__new__", label: "New employer…", action: true, separated: true },
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /^Employer/ }));
    expect(screen.getByRole("separator")).toBeInTheDocument();
    const create = screen.getByRole("option", { name: "New employer…" });
    expect(create).toHaveAttribute("aria-selected", "false");
    await user.click(create);
    expect(onChange).toHaveBeenCalledWith("__new__");
  });

  test("searches once there are enough options", async () => {
    const user = userEvent.setup();
    const farms = Array.from({ length: 8 }, (_, i) => ({
      value: String(i),
      label: i === 5 ? "Kiwi Orchards" : `Farm ${i}`,
    }));
    renderWithIntl(
      <ChoiceRow
        label="Employer"
        value="0"
        onChange={vi.fn()}
        options={farms}
        searchPlaceholder="Search employers"
      />
    );

    await user.click(screen.getByRole("button", { name: /^Employer/ }));
    await user.type(screen.getByLabelText("Search employers"), "kiwi");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.type(screen.getByLabelText("Search employers"), "zzz");
    expect(screen.getByText("No item found")).toBeInTheDocument();
  });
});

describe("ChoicePopover", () => {
  test("floats the options and picks one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithIntl(
      <ChoicePopover label="Paid in" value="AUD" options={CURRENCIES} onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: /^Paid in/ }));
    await user.click(screen.getByRole("option", { name: /EUR/ }));
    expect(onChange).toHaveBeenCalledWith("EUR");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
