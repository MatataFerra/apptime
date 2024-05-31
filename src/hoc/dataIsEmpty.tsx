import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function dataIsEmpty<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & { data: unknown[]; emptyContent: string }> {
  function WithData({
    data,
    emptyContent,
    ...props
  }: { data: unknown[]; emptyContent: string } & P) {
    if (data.length === 0) {
      return (
        <Stack
          classes="min-h-20 w-full border border-dashed p-4"
          alignItems="center"
          justifyContent="center"
        >
          <Text classes="text-center">{emptyContent}</Text>
        </Stack>
      );
    }

    return <WrappedComponent {...(props as P)} />;
  }

  return WithData;
}

export default dataIsEmpty;
