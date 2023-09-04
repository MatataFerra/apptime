"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components";

function LoginScreen() {
  return (
    <div>
      <Button variants="primary" onClick={() => signOut()}>
        Logout
      </Button>
    </div>
  );
}

export default LoginScreen;
