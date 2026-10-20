import Submit from "@/components/structures/Settings/Submit";

import { DataSection } from "./lazy";

export default async function Settings() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <Submit />
      <DataSection />
    </div>
  );
}
