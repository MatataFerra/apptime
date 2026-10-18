import { forwardRef, type LiHTMLAttributes, type Ref } from "react";

import isEmpty from "lodash/isEmpty";

interface DataListProps extends LiHTMLAttributes<HTMLLIElement> {
  data: string[] | undefined;
}

function Datalist({ data, onClick, ...rest }: DataListProps, ref: Ref<HTMLUListElement>) {
  return (
    <>
      {!isEmpty(data) ? (
        <ul
          role="listbox"
          ref={ref}
          className="absolute top-full z-10 w-full animate-fade-in space-y-2 rounded-b-md border border-t-0 border-border-strong bg-surface py-1 text-ink shadow-float"
        >
          {data?.map((name) => (
            <li
              role="listitem"
              onClick={onClick}
              key={name}
              className="w-full p-2 capitalize hover:bg-surface-sunken active:bg-surface-sunken"
              {...rest}
            >
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default forwardRef(Datalist);
