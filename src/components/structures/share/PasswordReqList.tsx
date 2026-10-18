import type { PassedErrors } from "@/types";

import Icon from "@/components/ui/Icons";

import { PASSWORD } from "@/utils/constants";
import { generateRandomID } from "@/utils/helpers/generateRandomID";

interface Props {
  errors: PassedErrors;
  password: string;
}

function List({ errors, password }: Props) {
  return (
    <ul className="flex list-none flex-col gap-1.5 text-sm">
      {Object.entries(PASSWORD.PASSWORD_REQUIREMENTS).map((reqs) => {
        const [type, requirement] = reqs as [type: keyof PassedErrors, requirement: string];

        return (
          <li
            key={generateRandomID()}
            className={`flex items-center gap-2 ${
              password?.length > 0
                ? !errors[type]
                  ? "text-accent"
                  : "text-destructive"
                : "text-ink-muted"
            }`}
          >
            <Icon.check width={15} height={15} fill="currentColor" />
            {requirement}
          </li>
        );
      })}
    </ul>
  );
}

export default List;
