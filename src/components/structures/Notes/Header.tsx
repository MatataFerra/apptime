import Input from "@/components/ui/Input";

import useTrack from "@/hooks/useTrack";

import { useShiftData } from "@/store/useShiftData";

/** Job name of the running shift; saved when the shift is finished. */
function Header() {
  const { data, setData } = useShiftData((state) => state);
  const {
    shiftUnclosed: { shift },
  } = useTrack();

  return (
    <Input
      name="notes-job-name"
      label="Job name"
      labelClasses="text-fast-ink"
      placeholder="Packhouse, apple picking…"
      defaultValue={data.name || shift?.name || ""}
      classes="bg-surface"
      onChange={(e) => setData({ name: e.target.value })}
    />
  );
}

export default Header;
