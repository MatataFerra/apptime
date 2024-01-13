import { Fragment } from "react";

import { FormStep } from "@/types/forms";

import NumberRoundBadge from "@/components/NumberRoundBadge";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";

const ARRAY = [
  {
    id: FormStep.PERSONAL_INFO,
    title: "Personal info",
  },
  {
    id: FormStep.PAY_INFO,
    title: "Pay info",
  },
  {
    id: FormStep.SHIFT_INFO,
    title: "Shift info",
  },
];

type Props = {
  steps?: {
    id: FormStep;
    title: string;
  }[];
};

function Stepper({ steps = ARRAY }: Props) {
  return (
    <>
      <nav className="flex w-full flex-row items-center justify-between gap-4">
        {steps.map(({ title, id }, index) => (
          <Fragment key={crypto.randomUUID()}>
            <Stack
              alignItems="center"
              justifyContent="center"
              classes="flex w-full flex-row gap-2 text-xs"
            >
              <NumberRoundBadge index={index} id={id} title={title} />
            </Stack>
            {index !== steps.length - 1 && <Line id={id} />}
          </Fragment>
        ))}
      </nav>
    </>
  );
}

export default Stepper;
