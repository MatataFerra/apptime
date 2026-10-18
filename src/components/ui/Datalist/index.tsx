import { forwardRef, type Ref } from "react";

import isEmpty from "lodash/isEmpty";

interface DataListProps {
  data: string[] | undefined;
  /** Called with the suggestion exactly as stored (not as displayed). */
  onSelect: (value: string) => void;
}

function Datalist({ data, onSelect }: DataListProps, ref: Ref<HTMLUListElement>) {
  if (isEmpty(data)) return null;

  return (
    <ul
      role="listbox"
      ref={ref}
      className="absolute top-full z-10 w-full animate-fade-in rounded-b-md border border-t-0 border-border-strong bg-surface py-1 text-ink shadow-float"
    >
      {data?.map((name) => (
        <li key={name} role="option" aria-selected={false}>
          <button
            type="button"
            onClick={() => onSelect(name)}
            className="w-full px-3 py-2.5 text-left hover:bg-surface-sunken active:bg-surface-sunken"
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default forwardRef(Datalist);
