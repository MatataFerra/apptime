import dynamic from "next/dynamic";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const ProfileCard = dynamic(() => import("@/components/structures/Settings/ProfileCard"), {
  ssr: false,
});

export default async function BodyPage() {
  return (
    <>
      <ModuleTitle module={PATH_NAMES.SETTINGS} title="Settings" />
      <ProfileCard />
    </>
  );
}
