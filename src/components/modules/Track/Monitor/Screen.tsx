import { Tracker } from "./Screen.lazy";

/**
 * The tracker monitor: the one dark, high-contrast surface in the app.
 */
async function Screen() {
  return (
    <article className="relative flex min-h-80 w-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-surface-inverse px-5 pt-5.5 pb-4.5 text-ink-inverse">
      <Tracker />
    </article>
  );
}

export default Screen;
