import Submit from "@/components/structures/Settings/Submit";

import { DataSection, SecuritySection } from "./lazy";

export default async function Settings() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <Submit />
      <SecuritySection />
      <DataSection />
    </div>
  );
}
