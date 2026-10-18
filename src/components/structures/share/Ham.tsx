import { Menu } from "lucide-react";

function Ham() {
  return (
    <span className="flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-sunken">
      <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">Open menu</span>
    </span>
  );
}

export default Ham;
