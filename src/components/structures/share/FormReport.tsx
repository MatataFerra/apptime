import PopoverBase from "@/components/structures/share/Popover";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  startDate: string;
  workedTime: string | undefined;
  earnings: number;
};

function FormReport({ startDate, workedTime, earnings }: Props) {
  return (
    <Stack orientation="vertical">
      <Text variant="subtitle" classes="text-sm">
        You are going to upload:
      </Text>
      <Text classes="text-sm">Start date: {startDate}</Text>
      <Text classes="text-sm">Worked time: {workedTime ? workedTime : "expecting data..."}</Text>
      <Text classes="text-sm">
        Estimated earnings: <PopoverBase content={`Without taxes`} classes="w-fit" /> ${" "}
        {String(earnings.toFixed(2))}
      </Text>
    </Stack>
  );
}

export default FormReport;
