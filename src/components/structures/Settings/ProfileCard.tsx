"use client";

import Skeleton from "@/components/ui/Skeleton";

import useUser from "@/hooks/useUser";

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

/** Who is signed in, at the top of Settings. */
function ProfileCard() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <Skeleton classes="h-22 w-full rounded-xl" />;
  if (!user) return null;

  return (
    <section className="flex w-full items-center gap-3.5 rounded-xl bg-surface-inverse p-4 text-ink-inverse">
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-live display-title text-2xl leading-none text-on-live"
        aria-hidden="true"
      >
        {initials(user.name, user.email)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[1.0625rem] font-semibold">
          {user.name || "Your account"}
        </span>
        <span className="truncate text-sm text-ink-inverse/70">{user.email}</span>
      </div>
    </section>
  );
}

export default ProfileCard;
