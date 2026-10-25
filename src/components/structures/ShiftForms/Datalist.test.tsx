import { useState } from "react";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";

import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";

import { renderWithIntl } from "#/__test__/utils/intl";

const NAMES = ["Web Developer", "Box Maker"];

function NameField({ field, hidden = false }: { field: string; hidden?: boolean }) {
  const [name, setName] = useState("");
  const setWriting = useDatalistStore((state) => state.setWriting);
  return (
    <fieldset hidden={hidden} className="relative">
      <input
        aria-label={field}
        value={name}
        onKeyDown={() => setWriting(field)}
        onChange={(e) => setName(e.target.value)}
      />
      <DatalistShiftNames
        field={field}
        data={NAMES.filter((n) => n.toLowerCase().includes(name.toLowerCase()) && n !== name)}
        value={name}
        onSelect={setName}
      />
    </fieldset>
  );
}

describe("DatalistShiftNames", () => {
  beforeEach(() => useDatalistStore.setState({ writing: null }));

  test("picks a suggestion while the other mode's form stays mounted", async () => {
    // As on the Production and Fast charge pages: the "one shift" tab stays
    // mounted (hidden) while "several days" is in use.
    const user = userEvent.setup();
    renderWithIntl(
      <>
        <NameField field="production-name" hidden />
        <NameField field="production-batch-name" />
      </>
    );

    const input = screen.getByLabelText("production-batch-name");
    await user.type(input, "We");
    expect(screen.getAllByRole("listbox")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Web Developer" }));
    expect(input).toHaveValue("Web Developer");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test("closes when tapping outside its own list", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <>
        <NameField field="fast-batch-name" />
        <button type="button">elsewhere</button>
      </>
    );

    await user.type(screen.getByLabelText("fast-batch-name"), "b");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
