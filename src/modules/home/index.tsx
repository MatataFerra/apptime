"use client";

import { signOut } from "next-auth/react";

import Button from "@/components/Button";

export default function HomeModule() {
  return (
    <>
      <Button onClick={() => signOut()}>Logout</Button>
    </>
  );
}
