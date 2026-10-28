import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ config: { holidayRate: 2 } as { holidayRate?: number } }));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: mocks.config } }) }));

import HolidayChoice from "@/components/structures/ShiftForms/HolidayChoice";

import { renderWithIntl } from "#/__test__/utils/intl";

describe("HolidayChoice", () => {
  test("shows the holiday multiplier from Settings", () => {
    renderWithIntl(<HolidayChoice value="none" onChange={() => {}} />, "es");
    expect(screen.getByText("Se paga ×2")).toBeInTheDocument();
  });

  test("1.5 by default, written for the language", () => {
    mocks.config = {};
    renderWithIntl(<HolidayChoice value="worked" onChange={() => {}} />, "es");
    expect(screen.getByText("Se paga ×1,5")).toBeInTheDocument();
  });
});
