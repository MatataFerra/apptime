import Input from "@/components/ui/Input";

import { useShiftData } from "@/store/useShiftData";

function Header() {
  const { setData } = useShiftData((state) => state);
  return (
    <Input
      placeholder="Title your job"
      variant="outlined"
      classes="w-full bg-warning-soft [&>input]:bg-warning-soft"
      onChange={(e) => setData({ name: e.target.value })}
    />
  );
}

export default Header;
