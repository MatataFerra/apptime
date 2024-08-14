import { redirect } from "next/navigation";

import UserService from "@/services/User";

export default async function NotFound() {
  const user = await UserService.getSessionUser();
  if (process.env.STAGING === "false") {
    return redirect("/");
  }

  if (process.env.STAGING === "true" && user?.role === "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-center">
      <div className="text-white">
        <h1 className="text-4xl font-bold">Coming Soon</h1>
        <p className="mt-4 text-lg">We are working on something awesome!</p>
      </div>
    </div>
  );
}
