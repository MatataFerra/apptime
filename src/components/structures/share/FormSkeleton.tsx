import TaxPickerSkeleton from "@/components/structures/SalaryItems/TaxPickerSkeleton";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";

/*
 * Placeholders with the same boxes as the shift forms' fields, so the
 * page doesn't jump when the real form replaces them. Each mirrors one
 * component: Input, ChoiceRow (SelectRow), HolidayChoice, the weekday
 * picker, the taxes block and the big submit button.
 */

/** Input with its label: text-sm label, mb-1.5, then the min-h-12 box. */
export function FieldSkeleton({ classes, label = "w-24" }: { classes?: string; label?: string }) {
  return (
    <div className={cn("w-full", classes)}>
      <Skeleton classes={cn("mb-1.5 h-5", label)} />
      <Skeleton classes="h-12 w-full" />
    </div>
  );
}

/** Two fields side by side (start | finish, value | quantity). */
export function FieldPairSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 gap-2">
      <FieldSkeleton />
      <FieldSkeleton />
    </div>
  );
}

/** "Employer  [Farm ▾]": ChoiceRow's label on the left, its h-11 button on the right. */
export function RowSkeleton({ label = "w-20" }: { label?: string }) {
  return (
    <div className="mt-3 mb-1 flex w-full items-center justify-between gap-3">
      <Skeleton classes={cn("h-5", label)} />
      <Skeleton classes="h-11 w-2/5 rounded-xl" />
    </div>
  );
}

/** HolidayChoice: its question, then three min-h-13 options. */
export function HolidaySkeleton() {
  return (
    <div className="mt-2 flex w-full flex-col gap-2">
      <Skeleton classes="mb-2 h-5 w-48" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} classes="h-13 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Batch schedule: first start | finish, "until", and the seven weekday buttons. */
export function ScheduleSkeleton() {
  return (
    <>
      <FieldPairSkeleton />
      <FieldSkeleton />
      <div className="w-full">
        <Skeleton classes="mb-1.5 h-5 w-28" />
        <div className="grid grid-cols-7 gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} classes="h-10" />
          ))}
        </div>
      </div>
    </>
  );
}

/** The module's Drawer: taxes and contributions, inline. */
export function TaxesSkeleton() {
  return (
    <div className="my-2 flex w-full flex-col gap-3">
      <TaxPickerSkeleton />
      <TaxPickerSkeleton kind="contributions" />
    </div>
  );
}

/** The full-width h-14 submit / review button. */
export function SubmitSkeleton() {
  return <Skeleton classes="h-14 w-full rounded-2xl" />;
}

/** The form's own column: fields 8px apart, like the forms' wrapping Stack. */
export function FormSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true" className="flex w-full flex-col gap-2">
      {children}
    </div>
  );
}
