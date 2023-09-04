import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";

import i18n from "@/services/i18n";

import { authOptions } from "@/utils/auth";

export async function GET(req: NextApiRequest & NextRequest, res: NextResponse & NextApiResponse) {
  const locale = new i18n("en").getLocale(req);
  const cloneOptions = _.cloneDeep(authOptions);
  const options = _.assign(cloneOptions, {
    pages: {
      signIn: `/${locale}/login`,
    },
  });
  return await NextAuth(req, res, options);
}

export async function POST(req: NextApiRequest & NextRequest, res: NextResponse & NextApiResponse) {
  return await NextAuth(req, res, authOptions);
}
