import { PassedErrors } from "@/types";

import Icon from "@/components/ui/Icons";

import { PASSWORD } from "@/utils/constants";
import { generateRandomID } from "@/utils/helpers/generateRandomID";

interface Props {
  errors: PassedErrors;
  password: string;
}

function List({ errors, password }: Props) {
  return (
    <ul className="list-inside list-none">
      {Object.entries(PASSWORD.PASSWORD_REQUIREMENTS).map((reqs) => {
        const [type, requirement] = reqs as [type: keyof PassedErrors, requirement: string];

        return (
          <li key={generateRandomID()} className="flex items-center gap-2">
            <Icon.check
              width={15}
              height={15}
              fill={password?.length > 0 ? (!errors[type] ? "#00ff37" : "#aa0000") : "#1C274C"}
            />
            {requirement}
          </li>
        );
      })}
    </ul>
  );
}

export default List;
