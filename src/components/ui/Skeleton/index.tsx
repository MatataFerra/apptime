import { cn } from "@/utils/helpers/styleMerger";

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  classes?: string;
}

function Skeleton({ classes, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-surface-sunken", classes)} {...props} />;
}

export default Skeleton;
