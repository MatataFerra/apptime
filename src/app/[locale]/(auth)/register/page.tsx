"use client";
import { userMockedParsed } from "#/mocks";

export default function Register() {
  async function onRegister(e: any) {
    e.preventDefault();
    const res = await fetch("/api/user/create", {
      body: JSON.stringify({
        ...userMockedParsed,
        password: "567",
        email: "cinco@gmail.com",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await res.json();
    // eslint-disable-next-line no-console
    console.log(result);
  }

  return (
    <div className="bg-grey-lighter flex min-h-screen flex-col">
      <div className="container mx-auto flex max-w-sm flex-1 flex-col items-center justify-center px-2">
        <div className="w-full rounded bg-white px-6 py-8 text-black shadow-md">
          <h1 className="mb-8 text-center text-3xl">Sign up</h1>
          <input
            type="text"
            className="border-grey-light mb-4 block w-full rounded border p-3"
            name="fullname"
            placeholder="Full Name"
          />

          <input
            type="text"
            className="border-grey-light mb-4 block w-full rounded border p-3"
            name="email"
            placeholder="Email"
          />

          <input
            type="password"
            className="border-grey-light mb-4 block w-full rounded border p-3"
            name="password"
            placeholder="Password"
          />
          <input
            type="password"
            className="border-grey-light mb-4 block w-full rounded border p-3"
            name="confirm_password"
            placeholder="Confirm Password"
          />

          <button
            onClick={onRegister}
            className="hover:bg-green-dark my-1 w-full rounded bg-green-600 py-3 text-center text-white focus:outline-none"
          >
            Create Account
          </button>

          <div className="text-grey-dark mt-4 text-center text-sm">
            By signing up, you agree to the
            <a className="border-grey-dark text-grey-dark border-b no-underline" href="#">
              Terms of Service
            </a>{" "}
            and
            <a className="border-grey-dark text-grey-dark border-b no-underline" href="#">
              Privacy Policy
            </a>
          </div>
        </div>

        <div className="text-grey-dark mt-6">
          Already have an account?
          <a className="border-blue text-blue border-b no-underline" href="#">
            Log in
          </a>
          .
        </div>
      </div>
    </div>
  );
}
