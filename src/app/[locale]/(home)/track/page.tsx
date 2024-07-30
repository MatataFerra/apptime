import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import type { LocaleParams } from "@/types";

import Title from "@/components/structures/share/ModuleTitle";
import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const maxDuration = 15;
export const dynamic = "force-static";

export default async function TrackPage({ params }: { params: LocaleParams }) {
  return <Title title="Track" subtitle="Get your exact time while you work" />;
}
