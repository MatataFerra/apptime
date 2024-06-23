import type { ChangeEvent } from "react";

import isEmpty from "lodash/isEmpty";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  taxes: any;
  setSaveTaxes: (value: boolean) => void;
};

function Checkbox({ taxes, setSaveTaxes }: Props) {
  return (
    <>
      {!isEmpty(taxes) ? (
        <Stack alignItems="center" classes="w-full animate-fade-in transition-all">
          <Text as="label" htmlFor="save-taxes">
            save taxes for future use
          </Text>
          <input
            className="size-4"
            type="checkbox"
            id="save-taxes"
            name="save-taxes"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSaveTaxes(Boolean(e.target.checked))}
          />
        </Stack>
      ) : null}
    </>
  );
}

export default Checkbox;
