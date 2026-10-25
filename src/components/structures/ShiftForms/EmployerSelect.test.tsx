import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/hooks/useEmployers", () => {
  const all = [{ id: 1, name: "Berry Farm", archived: false }];
  return {
    default: () => ({ employers: all, byId: new Map(all.map((e) => [e.id, e])), isLoading: false }),
  };
});
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));
vi.mock("@/components/structures/ShiftForms/NewEmployer", () => ({
  default: () => <p>new employer form</p>,
}));

import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";

import { renderWithIntl } from "#/__test__/utils/intl";

describe("EmployerSelect in the edit dialog", () => {
  test("a shift without an employer shows a link to add one", async () => {
    const user = userEvent.setup();
    renderWithIntl(<EmployerSelect allowCreate createLink value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add an employer for this shift/i }));
    expect(screen.getByText("new employer form")).toBeInTheDocument();
  });

  test("no link once the shift has one", () => {
    renderWithIntl(<EmployerSelect allowCreate createLink value={1} onChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /add an employer for this shift/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Employer: Berry Farm/ })).toBeInTheDocument();
  });
});
