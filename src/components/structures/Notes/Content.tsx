import Buttons from "@/components/structures/Notes/Buttons";
import Header from "@/components/structures/Notes/Header";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends React.PropsWithChildren<{}> {}

function Content({ children }: Props) {
  return (
    <Stack
      classes={cn(
        "absolute top-0 h-52 w-full rounded-lg bg-white p-4 shadow-lg",
        "grid grid-cols-1 grid-rows-[auto,1fr] gap-2 rounded-none bg-yellow-400 p-0"
      )}
    >
      <Header />
      {children}
      <Buttons />
    </Stack>
  );
}

export default Content;
