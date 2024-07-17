import Option from "@/components/structures/SheetHamMenu/Option";
import Title from "@/components/structures/SheetHamMenu/Title";
import Stack from "@/components/ui/Stack";

type DrawerOption = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

const MODULES: DrawerOption[] = [
  {
    id: "fast-charge",
    label: "Fast charge",
    dataTestId: "fast-charge",
    url: "/fast-charge",
  },
  {
    id: "production-job",
    label: "Production Job",
    dataTestId: "production-job",
    url: "/production",
  },
  {
    id: "track-time",
    label: "Track time",
    dataTestId: "track-time",
    url: "/track",
  },
];

const FEATURES: DrawerOption[] = [
  {
    id: "estimate-income",
    label: "Estimate income",
    dataTestId: "estimate-income",
    url: "/incomes",
  },
  {
    id: "compare",
    label: "Compare",
    dataTestId: "compare",
    url: "/compare",
  },
];

const USER_OPTIONS: DrawerOption[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    dataTestId: "dashboard",
    url: "/dashboard",
  },

  {
    id: "settings",
    label: "Settings",
    dataTestId: "settings",
    url: "/settings",
  },
];

function Options() {
  return (
    <Stack as="div" orientation="vertical" spacing={0} classes="w-full divide-y divide-sky-300/50">
      <Stack as="div" orientation="vertical" classes="w-full py-2">
        <Title title="User options" />
        {USER_OPTIONS.map((option) => (
          <Option key={option.id} option={option} />
        ))}
      </Stack>
      <Stack as="div" orientation="vertical" classes="w-full py-2">
        <Title title="Modules" />
        {MODULES.map((option) => (
          <Option key={option.id} option={option} />
        ))}
      </Stack>
      <Stack as="div" orientation="vertical" classes="w-full py-2">
        <Title title="Features" />
        {FEATURES.map((option) => (
          <Option key={option.id} option={option} />
        ))}
      </Stack>
    </Stack>
  );
}

export default Options;
