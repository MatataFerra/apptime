import { forwardRef, type LiHTMLAttributes, type Ref } from "react";

import isEmpty from "lodash/isEmpty";

interface DataListProps extends LiHTMLAttributes<HTMLLIElement> {
  data: string[];
}

function Datalist({ data, onClick, ...rest }: DataListProps, ref: Ref<HTMLUListElement>) {
  return (
    <>
      {!isEmpty(data) ? (
        <ul
          role="listbox"
          ref={ref}
          className="absolute top-full z-10 w-full animate-fade-in space-y-2 border border-t-0 border-slate-300 bg-white py-2 text-slate-500/80 shadow-md"
        >
          {data.map((name) => (
            <li
              role="listitem"
              onClick={onClick}
              key={name}
              className="w-full p-2 capitalize hover:bg-slate-200/40 active:bg-slate-200/60"
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
