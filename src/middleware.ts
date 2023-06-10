// import { authOptions } from "@/utils/auth";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   console.log({ path: req.nextUrl.pathname });
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return console.log("no session");
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/protected"],
// };

export { default } from "next-auth/middleware";

export const config = { matcher: ["/protected"] };
