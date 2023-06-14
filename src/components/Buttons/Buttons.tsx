"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function LoginButton() {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={() => signIn()}
    >
      Sign in
    </button>
  );
}

export function RegisterButton() {
  return (
    <Link
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      href="/register"
    >
      Register
    </Link>
  );
}

export function LogoutButton() {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}

export function ProfileButton() {
  return (
    <Link
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      href="/profile"
    >
      Profile
    </Link>
  );
}
