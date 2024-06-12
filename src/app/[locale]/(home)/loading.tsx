import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";

export default function LoadingHome() {
  return (
    <>
      <Stack
        classes="h-[90dvh] w-full"
        justifyContent="center"
        alignItems="center"
        orientation="vertical"
        spacing={4}
      >
        <Loader.progress />
      </Stack>
    </>
  );
}
