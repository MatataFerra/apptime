import { useTranslations } from "next-intl";

import Input from "@/components/ui/Input";

import useTrack from "@/hooks/useTrack";

import { useShiftData } from "@/store/useShiftData";

/** Job name of the running shift; saved when the shift is finished. */
function Header() {
  const { data, setData } = useShiftData((state) => state);
  const t = useTranslations("notes");
  const {
    shiftUnclosed: { shift },
  } = useTrack();

  return (
    <Input
      name="notes-job-name"
      label={t("job_name")}
      labelClasses="text-fast-ink"
      placeholder={t("job_name_placeholder")}
      defaultValue={data.name || shift?.name || ""}
      classes="bg-surface"
      onChange={(e) => setData({ name: e.target.value })}
    />
  );
}

export default Header;
