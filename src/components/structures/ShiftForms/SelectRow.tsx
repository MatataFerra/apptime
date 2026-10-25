"use client";

import { type ChoiceOption, ChoicePopover, ChoiceRow } from "@/components/ui/Choice";

/** The pill used by the shift settings rows when it sits next to something else. */
export function PillSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  label: string;
}) {
  return <ChoicePopover label={label} value={value} options={options} onChange={onChange} />;
}

/**
 * A setting of the shift on one line: label on the left, a pill on the
 * right ("Employer  [Farm ▾]", "Paid in  [AUD ▾]"), and its options opening
 * under the row. Its own top margin keeps it clear of the field above,
 * whatever form it sits in.
 */
function SelectRow<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
  searchPlaceholder,
  classes,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  /** What the pill says when it differs from the option's label. */
  display?: (value: T) => string;
  searchPlaceholder?: string;
  classes?: string;
}) {
  return (
    <ChoiceRow
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      display={display}
      searchPlaceholder={searchPlaceholder}
      classes={classes}
    />
  );
}

export default SelectRow;
