import { Insights } from "./lazy";

export default async function Charts() {
  return (
    <section aria-labelledby="insights-title" className="flex flex-col gap-3">
      <h2 id="insights-title" className="px-1 text-[0.9375rem] font-semibold text-ink">
        Your earnings
      </h2>
      <Insights />
    </section>
  );
}
