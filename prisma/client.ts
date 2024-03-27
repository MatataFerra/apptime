import { createClient } from "@libsql/client/web";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

import ut from "@/services/Utilities/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL
  ? process.env.NEXT_PUBLIC_TURSO_DATABASE_URL.toString()
  : "";
const token = process.env.TURSO_AUTH_TOKEN;
const libsql = createClient({
  url: url,
  authToken: `${token}`,
});

const adapter = new PrismaLibSQL(libsql);

let prisma: PrismaClient;

function newPrismaClient() {
  if (ut.toBool(process.env.TURSO_ON!)) {
    return new PrismaClient({ adapter });
  } else {
    return new PrismaClient();
  }
}

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    prisma = newPrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = newPrismaClient();
    }

    prisma = global.prisma;
  }
}

//@ts-ignore
export default prisma;
