import { DataSection, SaveBar, SecuritySection } from "./lazy";

export default async function Settings() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <SaveBar />
      <SecuritySection />
      <DataSection />
    </div>
  );
}
