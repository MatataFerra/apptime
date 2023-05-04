// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "#/prisma/client";
import { Data, TypeData } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TypeData>
) {
  const user = await prisma.user.findMany({
    include: {
      shifts: true,
    },
  });

  const shift = await prisma.shift.findMany();

  const parsedData = Data.parse({
    message: "Hola",
    response: true,
    user,
    shift,
  });

  return res.json({
    message: parsedData.message,
    response: parsedData.response,
    user: parsedData.user,
    shift: parsedData.shift,
  });
}
