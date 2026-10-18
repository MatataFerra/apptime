import NextLink from "next/link";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function SuccessPage() {
  return (
    <div className="flex flex-col space-y-12 self-center">
      <p className="text-center text-2xl font-semibold">
        The email has been sent, please check your inbox.
      </p>
      <NextLink
        href={PATH_NAMES.HOME}
        className={
          "flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface p-3 text-center text-lg text-ink transition-all hover:bg-surface-sunken"
        }
        role="button"
      >
        {" "}
        Go back to home
      </NextLink>
    </div>
  );
}
