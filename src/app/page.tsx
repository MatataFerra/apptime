import {
  LoginButton,
  LogoutButton,
  RegisterButton,
} from "@/components/Buttons";
import ProfileMenu from "@/components/Test";
import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex h-screen flex-col items-center justify-center p-24">
      <div className="text-white flex-col bg-gray-950 border-blue-600 flex justify-center items-center w-full h-full">
        Content
        <div className="flex gap-2">
          <LoginButton />
          <RegisterButton />
          <LogoutButton />
          <Link
            href="/protected"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            <p>Protected</p>
          </Link>
          <Link
            href="/admin"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            <p>Admin</p>
          </Link>
        </div>
        <div>
          <h1>Server Session</h1>
          <pre>{JSON.stringify(session)}</pre>
        </div>
        <div>
          <h1>Client Session</h1>
          <ProfileMenu />
        </div>
      </div>
    </main>
  );
}
