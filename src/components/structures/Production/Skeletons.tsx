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

/** Inputs: name, employer, start | finish, value | quantity, currency, holiday. */
export function InputsSkeleton() {
  return (
    <FormSkeleton>
      <FieldSkeleton />
      <RowSkeleton />
      <FieldPairSkeleton />
      <FieldPairSkeleton />
      <RowSkeleton label="w-16" />
      <HolidaySkeleton />
    </FormSkeleton>
  );
}

/** Batch: name, employer, schedule, value | quantity, currency; then taxes and review. */
export function BatchSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <FormSkeleton>
        <FieldSkeleton />
        <RowSkeleton />
        <ScheduleSkeleton />
        <FieldPairSkeleton />
        <RowSkeleton label="w-16" />
      </FormSkeleton>
      <TaxesSkeleton />
      <SubmitSkeleton />
    </div>
  );
}
