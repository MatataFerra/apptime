import { PassedErrors } from "@/types";

import { PASSWORD_REQUIREMENTS } from "@/utils/constants";
import { generateRandomID } from "@/utils/helpers/generateRandomID";
import { cm } from "@/utils/helpers/styleMerger";

interface Props {
  touchedFields: any;
  errors: PassedErrors;
}

function List({ touchedFields, errors }: Props) {
  return (
    <ul className="list-inside list-disc">
      {Object.entries(PASSWORD_REQUIREMENTS).map((reqs) => {
        const [type, requirement] = reqs as [type: keyof PassedErrors, requirement: string];

        return (
          <li
            key={generateRandomID()}
            className={cm(
              touchedFields.password
                ? touchedFields.password && !errors[type]
                  ? "text-green-500"
                  : "text-red-500"
                : "text-gray-500"
            )}
          >
            {requirement}
          </li>
        );
      })}
    </ul>
  );
}

export default List;
