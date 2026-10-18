import Option from "@/components/structures/SheetHamMenu/Option";
import Title from "@/components/structures/SheetHamMenu/Title";

type DrawerOption = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

const LOG_WORK: DrawerOption[] = [
  { id: "track-time", label: "Track", dataTestId: "track-time", url: "/track" },
  { id: "fast-charge", label: "Fast charge", dataTestId: "fast-charge", url: "/fast-charge" },
  { id: "production-job", label: "Production", dataTestId: "production-job", url: "/production" },
];

const MONEY: DrawerOption[] = [
  { id: "dashboard", label: "Dashboard", dataTestId: "dashboard", url: "/dashboard" },
  { id: "estimate-income", label: "Estimate", dataTestId: "estimate-income", url: "/incomes" },
  { id: "compare", label: "Compare", dataTestId: "compare", url: "/compare" },
];

const ACCOUNT: DrawerOption[] = [
  { id: "settings", label: "Settings", dataTestId: "settings", url: "/settings" },
];

const GROUPS = [
  { title: "Log work", options: LOG_WORK },
  { title: "Your money", options: MONEY },
  { title: "Account", options: ACCOUNT },
];

function Options() {
  return (
    <nav aria-label="Main" className="flex w-full flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <Title title={group.title} />
          {group.options.map((option) => (
            <Option key={option.id} option={option} />
          ))}
        </div>
      ))}
    </nav>
  );
}

export default Options;
