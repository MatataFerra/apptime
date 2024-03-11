import NotesButtons from "@/components/NotesButtons";
import NotesHeader from "@/components/NotesHeader";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends React.PropsWithChildren<{}> {}

function NotesContent({ children }: Props) {
  return (
    <Stack
      classes={cn(
        "absolute top-0 h-52 w-full rounded-lg bg-white p-4 shadow-lg",
        "grid grid-cols-1 grid-rows-[auto,1fr] gap-2 rounded-none bg-yellow-400 p-0"
      )}
    >
      <NotesHeader />
      {children}
      <NotesButtons />
    </Stack>
  );
}

export default NotesContent;
