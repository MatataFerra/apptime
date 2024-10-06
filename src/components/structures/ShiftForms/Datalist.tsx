import { useEffect, useRef } from "react";

import { useOnClickOutside } from "usehooks-ts";

import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Datalist from "@/components/ui/Datalist";

function DatalistShiftNames({
  data,
  setValue,
  value,
}: {
  data: string[] | undefined;
  value: string | null;
  setValue: (name: string | any, value: string | boolean | null, config?: Object) => void;
}) {
  const { isWritingName, setIsWriting } = useDatalistStore((state) => state);
  const listNamesRef = useRef(null);
  useOnClickOutside([listNamesRef], () => {
    if (isWritingName) {
      setIsWriting(false);
    }
  });

  useEffect(() => {
    if (!value) return setIsWriting(false);
  }, [setIsWriting, value]);

  return (
    <>
      {isWritingName ? (
        <Datalist
          data={data}
          ref={listNamesRef}
          onClick={(e) => {
            setValue("name", e.currentTarget.innerText);
            setIsWriting(false);
          }}
        />
      ) : null}
    </>
  );
}

export default DatalistShiftNames;
