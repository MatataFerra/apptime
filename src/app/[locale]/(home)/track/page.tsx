import Title from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const dynamic = "force-static";

export default async function TrackPage() {
  return (
    <Title module={PATH_NAMES.TRACK} title="Track" subtitle="Run the clock while you work." />
  );
}
