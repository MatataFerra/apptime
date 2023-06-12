"use client";

import { useSession } from "next-auth/react";

export default function ProfileMenu() {
  const { data, status } = useSession();

  return (
    <div>
      {status === "loading" && <div>Loading...</div>}
      <p>{data?.user?.name}</p>
      <p>{data?.user?.email}</p>
    </div>
  );
}
