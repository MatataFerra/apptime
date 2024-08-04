import type { PropsWithChildren, ReactNode } from "react";

export default async function LayoutReset({
  children,
  formReset,
}: PropsWithChildren<{ formReset: ReactNode }>) {
  return (
    <>
      <div className="space-y-12 self-center">
        {formReset}
        {children}
      </div>
    </>
  );
}
