import Input from "@/components/ui/Input";

import { useShiftData } from "@/store/useShiftData";

function Header() {
  const { setData, data } = useShiftData((state) => state);
  return (
    <Input
      placeholder="Title your job"
      value={data?.name ?? ""}
      variant="outlined"
      classes="w-full bg-yellow-200 [&>input]:bg-yellow-200"
      onChange={(e) => setData({ name: e.target.value })}
    />
  );
}

export default Header;
