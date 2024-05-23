import { UserType } from "@/types";

export function shortEmail({ user }: { user: UserType | null }): string {
  if (!user) return "";

  const splitEmail = user?.email.split("@");

  const shortEmail =
    splitEmail[0].length < 15
      ? splitEmail[0].slice(0, 15)
      : splitEmail[0].slice(0, 7) +
        "..." +
        splitEmail[0].slice(splitEmail[0].length - 5, splitEmail[0].length - 1);

  const joinEmail = [shortEmail, splitEmail[1]].join("@");

  return joinEmail;
}
