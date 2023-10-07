import { PassedErrors } from "@/types";

import Icon from "@/components/Icons";

import { PASSWORD } from "@/utils/constants";
import { generateRandomID } from "@/utils/helpers/generateRandomID";

interface Props {
  touchedFields: any;
  errors: PassedErrors;
}

function List({ touchedFields, errors }: Props) {
  return (
    <ul className="list-inside list-none">
      {Object.entries(PASSWORD.PASSWORD_REQUIREMENTS).map((reqs) => {
        const [type, requirement] = reqs as [type: keyof PassedErrors, requirement: string];

        return (
          <li key={generateRandomID()} className="flex items-center gap-2">
            <Icon.check
              width={15}
              height={15}
              fill={
                touchedFields.password
                  ? touchedFields.password && !errors[type]
                    ? "#00ff37"
                    : "#aa0000"
                  : "#1C274C"
              }
            />
            {requirement}
          </li>
        );
      })}
    </ul>
  );
}

export default List;
