import Image from "@/components/ui/Image";

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

type Props = {
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
};

/** Who is signed in, at the top of the side menu. Falls back to a plain title. */
function UserInfo({ user }: Props) {
  if (!user) {
    return <span className="text-[0.9375rem] font-semibold text-ink">Menu</span>;
  }

  return (
    <span className="flex items-center gap-3 rounded-2xl bg-surface-inverse p-3 text-left text-ink-inverse">
      {user.image ? (
        <Image classes="size-11 rounded-full" src={user.image} alt="" width={44} height={44} />
      ) : (
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-live display-title text-lg leading-none text-on-live"
          aria-hidden="true"
        >
          {initials(user.name, user.email)}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.9375rem] font-semibold">
          {user.name || "Your account"}
        </span>
        <span className="truncate text-[0.8125rem] font-normal text-ink-inverse/70">
          {user.email}
        </span>
      </span>
    </span>
  );
}

export default UserInfo;
