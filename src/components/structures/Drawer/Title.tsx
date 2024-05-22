import Text from "@/components/ui/Text";

type Props = {
  title: string;
};

function Title({ title }: Props) {
  return (
    <>
      <Text variant="label" classes="px-2">
        {title}
      </Text>
    </>
  );
}

export default Title;
