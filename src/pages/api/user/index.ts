/* eslint-disable no-console */
import prisma from "#/prisma/client";
import { Data, TypeData } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";

export default async function user(
  req: NextApiRequest,
  res: NextApiResponse<TypeData>
) {
  try {
    const user = await prisma.user.findFirst({
      include: {
        shifts: true,
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "User not found", response: false });

    const parsedData = Data.safeParse({
      message: "success",
      response: true,
      user,
    });

    if (!parsedData.success) {
      return res.status(400).json({
        message: parsedData.error.issues
          .map((issue) => issue.message)
          .join(","),
        response: false,
      });
    }

    return res.status(200).json({
      message: parsedData.data.message,
      response: parsedData.data.response,
      user: parsedData.data.user,
    });
  } catch (error) {
    // Manejar errores de forma adecuada
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", response: false });
  }
}
