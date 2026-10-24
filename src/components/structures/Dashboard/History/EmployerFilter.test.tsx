import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const employers = vi.hoisted(() =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: i === 0 ? "Berry Farm" : `Orchard ${i + 1}`,
    archived: i === 7,
  }))
);

vi.mock("@/hooks/useEmployers", () => ({
  default: () => ({
    employers: employers.filter((e) => !e.archived),
    byId: new Map(employers.map((e) => [e.id, e])),
    isLoading: false,
  }),
}));

import EmployerFilter from "@/components/structures/Dashboard/History/EmployerFilter";

import { renderWithIntl } from "#/__test__/utils/intl";

const counts = new Map<number | "none", number>([
  [1, 4],
  [2, 1],
  [8, 2],
  ["none", 3],
]);

describe("Employer filter", () => {
  test("lists the employers with shifts and their counts, and picks one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithIntl(<EmployerFilter value="all" onChange={onChange} counts={counts} />);

    await user.click(screen.getByTestId("history-employer-filter"));
    const list = screen.getByRole("listbox");
    const options = within(list).getAllByRole("option");

    // All, three employers with shifts (the archived one marked), No employer.
    expect(options.map((o) => o.textContent)).toEqual([
      "All employers10",
      "Berry Farm4",
      "Orchard 21",
      "Orchard 8 (removed)2",
      "No employer3",
    ]);

    await user.click(within(list).getByRole("option", { name: /Berry Farm/ }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("names the selected employer on the chip", () => {
    renderWithIntl(<EmployerFilter value={1} onChange={vi.fn()} counts={counts} />);
    expect(screen.getByTestId("history-employer-filter")).toHaveTextContent("Berry Farm");
  });

  test("searches once there are many employers", async () => {
    const user = userEvent.setup();
    const many = new Map<number | "none", number>(employers.map((e) => [e.id, 1]));
    renderWithIntl(<EmployerFilter value="all" onChange={vi.fn()} counts={many} />);

    await user.click(screen.getByTestId("history-employer-filter"));
    await user.type(screen.getByRole("searchbox"), "berry");

    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1);
  });

  test("hides itself when no shift has an employer", () => {
    renderWithIntl(
      <EmployerFilter value="all" onChange={vi.fn()} counts={new Map([["none", 2]])} />
    );
    expect(screen.queryByTestId("history-employer-filter")).not.toBeInTheDocument();
  });
});
