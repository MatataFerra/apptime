import {
  FieldPairSkeleton,
  FieldSkeleton,
  FormSkeleton,
  HolidaySkeleton,
  RowSkeleton,
  ScheduleSkeleton,
  SubmitSkeleton,
  TaxesSkeleton,
} from "@/components/structures/share/FormSkeleton";

/** Inputs: name, employer, start | finish, rate, currency, breaks, holiday. */
export function InputsSkeleton() {
  return (
    <FormSkeleton>
      <FieldSkeleton />
      <RowSkeleton />
      <FieldPairSkeleton />
      <FieldSkeleton label="w-28" />
      <RowSkeleton label="w-16" />
      <FieldSkeleton label="w-28" />
      <HolidaySkeleton />
    </FormSkeleton>
  );
}

/** Batch: name, employer, schedule, rate, currency, breaks; then taxes and review. */
export function BatchSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <FormSkeleton>
        <FieldSkeleton />
        <RowSkeleton />
        <ScheduleSkeleton />
        <FieldSkeleton label="w-28" />
        <RowSkeleton label="w-16" />
        <FieldSkeleton label="w-28" />
      </FormSkeleton>
      <TaxesSkeleton />
      <SubmitSkeleton />
    </div>
  );
}
