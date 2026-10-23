import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/hooks/useMoney", () => ({ useCurrency: () => "AUD" }));
vi.mock("@/server-actions/abn-lookup", () => ({
  onLookupAbn: vi.fn(async () => ({
    ok: true,
    kind: "details",
    details: {
      abn: "51 824 753 556",
      status: "Cancelled",
      statusSince: "2024-01-01",
      entityName: "SUNNY HOLDINGS PTY LTD",
      businessNames: ["SUNNY FARMS"],
      entityType: "Australian Private Company",
      state: "QLD",
      postcode: "4670",
      gstSince: null,
    },
  })),
}));

import EmployerForm from "@/components/structures/Employers/EmployerForm";

function setup() {
  const onSave = vi.fn();
  render(<EmployerForm busy={false} onCancel={() => {}} onSave={onSave} />);
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

  test("ABN lookup: warns on a cancelled ABN and keeps the legal name in the notes", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /look up abn/i }));
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
  });
});
